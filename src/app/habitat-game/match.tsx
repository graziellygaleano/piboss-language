import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getHabitatThemeById, HABITAT_THEMES, HabitatTheme, AnimalItem } from '@/data/gameData';
import { habitatGameSharedStyles } from '@/styles/habitat-game/gameStyles';
import { speakWord, stopAllAudio } from '@/services/audioService';
import {
  evaluatePiboStep,
  evaluateSessionCompletion,
  SessionResultItem,
} from '@/ai/piboAgent';
import { ModuleSuccessOverlay } from '@/components/ModuleSuccessOverlay';
import { saveThemeStars } from '@/services/storageService';

interface MatchRound {
  targetAnimal: AnimalItem;
  choices: AnimalItem[];
}

function buildMatchRounds(currentTheme: HabitatTheme): MatchRound[] {
  const otherHabitats = HABITAT_THEMES.filter((h) => h.id !== currentTheme.id);
  const shuffledTargets = [...currentTheme.animals].sort(() => 0.5 - Math.random());

  return shuffledTargets.map((target) => {
    const randomHabitat =
      otherHabitats[Math.floor(Math.random() * otherHabitats.length)] ?? HABITAT_THEMES[0];
    const distractor =
      randomHabitat.animals[Math.floor(Math.random() * randomHabitat.animals.length)] ??
      currentTheme.animals[0];

    const choices = Math.random() > 0.5 ? [target, distractor] : [distractor, target];
    return { targetAnimal: target, choices };
  });
}

export default function HabitatMatchScreen() {
  const { themeId } = useLocalSearchParams<{ themeId?: string }>();
  const theme = useMemo(() => getHabitatThemeById(themeId), [themeId]);

  const [rounds] = useState<MatchRound[]>(() => buildMatchRounds(theme));
  const [animalIndex, setAnimalIndex] = useState(0);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [flashFeedback, setFlashFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showModuleSuccess, setShowModuleSuccess] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    correctCount: number;
    totalAnimals: number;
    isApproved: boolean;
  } | null>(null);

  const [score, setScore] = useState(0);
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(null);
  const [lastQuality, setLastQuality] = useState<number | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [sessionResults, setSessionResults] = useState<SessionResultItem[]>([]);

  const maxPossibleScore = theme.animals.length * 20;
  const currentRound = rounds[animalIndex % rounds.length];
  const targetAnimal = currentRound.targetAnimal;

  useEffect(() => {
    setStepStartTime(Date.now());
  }, [animalIndex]);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const triggerFlash = (type: 'correct' | 'wrong') => {
    setFlashFeedback(type);
    setTimeout(() => {
      setFlashFeedback(null);
    }, 450);
  };

  const handleSelectAnimal = (animal: AnimalItem) => {
    stopAllAudio();
    setSelectedAnimalId(animal.id);
    speakWord(animal.nameEn);
  };

  const handleConfirm = async () => {
    if (!selectedAnimalId) return;
    stopAllAudio();

    const responseTimeMs = Date.now() - stepStartTime;
    setLastResponseTime(responseTimeMs);

    const chosenAnimal = currentRound.choices.find((a) => a.id === selectedAnimalId);
    const isCorrect = chosenAnimal ? chosenAnimal.habitatId === theme.id : false;
    const isLastRound = animalIndex + 1 >= rounds.length;

    const piboStep = await evaluatePiboStep({
      themeId: theme.id,
      animalId: targetAnimal.id,
      module: 'match',
      world: 'habitats',
      isCorrect,
      responseTimeMs,
      usedHint: false,
    });

    setLastQuality(piboStep.qualityScore);
    setLastAction(piboStep.action);

    const earned = isCorrect ? 20 : -5;
    const newScore = score + earned;
    setScore(newScore);

    const updatedResults: SessionResultItem[] = [
      ...sessionResults,
      {
        animalId: targetAnimal.id,
        isCorrect,
        responseTimeMs,
        usedHint: false,
        pointsEarned: earned,
        qualityScore: piboStep.qualityScore,
        action: piboStep.action,
      },
    ];
    setSessionResults(updatedResults);

    triggerFlash(isCorrect ? 'correct' : 'wrong');

    if (!isLastRound) {
      setAnimalIndex((prev) => prev + 1);
      setSelectedAnimalId(null);
    } else {
      const correctCount = updatedResults.filter((r) => r.isCorrect).length;
      evaluateSessionCompletion({
        themeId: theme.id,
        world: 'habitats',
        totalThemeAnimals: theme.animals.length,
        results: updatedResults,
      }).then((decision) => {
        setSummaryData({
          correctCount,
          totalAnimals: theme.animals.length,
          isApproved: decision.isApproved,
        });

        if (decision.isApproved) {
          saveThemeStars('habitats', theme.id, correctCount, theme.animals.length, true);
          speakWord(`Great job! Approved with ${decision.averageQualityPercentage} percent quality!`);
          setShowModuleSuccess(true);
        } else {
          saveThemeStars('habitats', theme.id, correctCount, theme.animals.length, false);
          speakWord('Try again to reach sixty percent quality!');
          setTimeout(() => {
            router.replace({
              pathname: '/summary',
              params: {
                world: 'habitats',
                themeId: theme.id,
                totalAnimals: String(theme.animals.length),
                correctCount: String(correctCount),
                isApproved: 'false',
              },
            });
          }, 900);
        }
      });
    }
  };

  const avgQualitySoFar =
    sessionResults.length > 0
      ? sessionResults.reduce((acc, r) => acc + (r.qualityScore ?? 0.5), 0) / sessionResults.length
      : null;

  const isConfirmedReady = selectedAnimalId !== null;

  return (
    <View style={habitatGameSharedStyles.screen}>
      <ModuleSuccessOverlay
        visible={showModuleSuccess}
        onFinish={() => {
          router.replace({
            pathname: '/summary',
            params: {
              world: 'habitats',
              themeId: theme.id,
              totalAnimals: String(summaryData?.totalAnimals ?? theme.animals.length),
              correctCount: String(summaryData?.correctCount ?? 0),
              isApproved: 'true',
            },
          });
        }}
      />
      {/* Overlay de feedback */}
      {flashFeedback && (
        <View
          pointerEvents="none"
          style={[
            habitatGameSharedStyles.feedbackOverlay,
            flashFeedback === 'correct'
              ? habitatGameSharedStyles.overlayCorrect
              : habitatGameSharedStyles.overlayWrong,
          ]}
        />
      )}

      {/* Topo Limpo: Voltar + Indicador de Etapas + Contador */}
      <View style={habitatGameSharedStyles.topNavigation}>
        <Pressable
          style={habitatGameSharedStyles.smallNavBtn}
          onPress={() => {
            stopAllAudio();
            router.replace({ pathname: '/levels', params: { world: 'habitats' } });
          }}
        >
          <Text style={habitatGameSharedStyles.smallNavBtnText}>◀ Níveis</Text>
        </Pressable>

        <View style={habitatGameSharedStyles.stageIndicator}>
          <View style={habitatGameSharedStyles.stageDot} />
          <View style={habitatGameSharedStyles.stageDot} />
          <View style={habitatGameSharedStyles.stageDot} />
          <View style={[habitatGameSharedStyles.stageDot, habitatGameSharedStyles.stageDotActive]} />
        </View>

        <Text style={habitatGameSharedStyles.counterText}>
          {animalIndex + 1}/{rounds.length}
        </Text>
      </View>

      {/* HUD Visual Temporário para Acompanhar a Qualidade Média do PIBO e Tempo */}
      <View style={habitatGameSharedStyles.debugHud}>
        <Text style={habitatGameSharedStyles.debugHudText}>
          🧠 Qualidade Média: {avgQualitySoFar ? `${Math.round(avgQualitySoFar * 100)}% (Q: ${avgQualitySoFar.toFixed(2)})` : 'Aguardando'} | Meta: ≥60% | Último: {lastAction ? `${lastAction.toUpperCase()} (Q: ${lastQuality?.toFixed(2)}, ${(lastResponseTime! / 1000).toFixed(1)}s)` : '-'} | Pts: {score}
        </Text>
      </View>

      {/* Centro: Quadro do Habitat Atual (SEM DICA) */}
      <View style={habitatGameSharedStyles.stageArea}>
        <View style={[habitatGameSharedStyles.bigHabitatBox, { backgroundColor: theme.color }]}>
          {/* Botão de Áudio Dedicado no Canto Superior Esquerdo */}
          <Pressable
            style={habitatGameSharedStyles.boxAudioBtn}
            onPress={() => speakWord(theme.nameEn)}
          >
            <Image
              source={require('@/assets/icons/music-on.png')}
              style={habitatGameSharedStyles.boxAudioIcon}
              resizeMode="contain"
            />
          </Pressable>

          {theme.image ? (
            <Image source={theme.image} style={habitatGameSharedStyles.bigHabitatImage} resizeMode="cover" />
          ) : (
            <Text style={habitatGameSharedStyles.bigHabitatEmoji}>{theme.emoji}</Text>
          )}
          <Text style={habitatGameSharedStyles.bigHabitatTitle}>{theme.nameEn}</Text>
          <Text style={habitatGameSharedStyles.bigHabitatSub}>{theme.namePt}</Text>
        </View>

        {/* Dois animais para escolha (Sem dica) */}
        <View style={habitatGameSharedStyles.twoChoicesRow}>
          {currentRound.choices.map((animal) => {
            const isSelected = selectedAnimalId === animal.id;
            return (
              <Pressable
                key={animal.id}
                style={[
                  habitatGameSharedStyles.animalChoiceCard,
                  isSelected && habitatGameSharedStyles.animalChoiceCardSelected,
                ]}
                onPress={() => handleSelectAnimal(animal)}
              >
                <Text style={habitatGameSharedStyles.animalChoiceEmoji}>{animal.emoji}</Text>
                <Text style={habitatGameSharedStyles.animalChoiceName}>{animal.nameEn}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Linha Inferior: Botão Confirmar #d91e50 */}
      <View
        style={[
          habitatGameSharedStyles.bottomRow,
          { opacity: isConfirmedReady ? 1 : 0.4, pointerEvents: isConfirmedReady ? 'auto' : 'none' },
        ]}
      >
        <Pressable
          disabled={!isConfirmedReady}
          style={[
            habitatGameSharedStyles.confirmBtn,
            !isConfirmedReady && habitatGameSharedStyles.confirmBtnDisabled,
          ]}
          onPress={handleConfirm}
        >
          <Text style={habitatGameSharedStyles.confirmBtnIcon}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}
