import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getThemeById, AnimalItem } from '@/data/gameData';
import { animalGameSharedStyles } from '@/styles/animal-game/gameStyles';
import { speakWord, stopAllAudio } from '@/services/audioService';
import {
  evaluatePiboStep,
  evaluateSessionCompletion,
  SessionResultItem,
} from '@/ai/piboAgent';
import { ModuleSuccessOverlay } from '@/components/ModuleSuccessOverlay';
import { saveThemeStars } from '@/services/storageService';

interface ChallengeRound {
  targetAnimal: AnimalItem;
  choices: AnimalItem[];
}

function buildChallengeRounds(animals: AnimalItem[]): ChallengeRound[] {
  const shuffled = [...animals].sort(() => 0.5 - Math.random());
  return shuffled.map((target) => {
    const others = animals.filter((a) => a.id !== target.id);
    const distractor =
      others[Math.floor(Math.random() * others.length)] ?? animals[0];
    const choices =
      Math.random() > 0.5 ? [target, distractor] : [distractor, target];
    return { targetAnimal: target, choices };
  });
}

export default function ChallengeScreen() {
  const { themeId } = useLocalSearchParams<{ themeId?: string }>();
  const theme = useMemo(() => getThemeById(themeId), [themeId]);

  const [rounds] = useState<ChallengeRound[]>(() => buildChallengeRounds(theme.animals));
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
  const currentAnimal = currentRound.targetAnimal;
  const choices = currentRound.choices;

  useEffect(() => {
    speakWord(currentAnimal.nameEn);
    setStepStartTime(Date.now());
  }, [animalIndex, currentAnimal]);

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
  };

  const handleConfirm = async () => {
    if (selectedAnimalId === null) return;
    stopAllAudio();

    const responseTimeMs = Date.now() - stepStartTime;
    setLastResponseTime(responseTimeMs);

    const isCorrect = selectedAnimalId === currentAnimal.id;
    const isLastRound = animalIndex + 1 >= rounds.length;

    const piboStep = await evaluatePiboStep({
      themeId: theme.id,
      animalId: currentAnimal.id,
      module: 'challenge',
      world: 'animals',
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
        animalId: currentAnimal.id,
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
        world: 'animals',
        totalThemeAnimals: theme.animals.length,
        results: updatedResults,
      }).then((decision) => {
        setSummaryData({
          correctCount,
          totalAnimals: theme.animals.length,
          isApproved: decision.isApproved,
        });

        if (decision.isApproved) {
          saveThemeStars('animals', theme.id, correctCount, theme.animals.length, true);
          speakWord(`Great job! Approved with ${decision.averageQualityPercentage} percent quality!`);
          setShowModuleSuccess(true);
        } else {
          saveThemeStars('animals', theme.id, correctCount, theme.animals.length, false);
          speakWord('Try again to reach sixty percent quality!');
          setTimeout(() => {
            router.replace({
              pathname: '/summary',
              params: {
                world: 'animals',
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
      ? (sessionResults.reduce((acc, r) => acc + (r.qualityScore ?? 0.5), 0) / sessionResults.length)
      : null;

  return (
    <View style={animalGameSharedStyles.screen}>
      <ModuleSuccessOverlay
        visible={showModuleSuccess}
        onFinish={() => {
          router.replace({
            pathname: '/summary',
            params: {
              world: 'animals',
              themeId: theme.id,
              totalAnimals: String(summaryData?.totalAnimals ?? theme.animals.length),
              correctCount: String(summaryData?.correctCount ?? 0),
              isApproved: 'true',
            },
          });
        }}
      />
      {/* Topo Limpo: Voltar + Contador */}
      <View style={animalGameSharedStyles.topNavigation}>
        <Pressable
          style={animalGameSharedStyles.smallNavBtn}
          onPress={() => {
            stopAllAudio();
            router.replace({ pathname: '/levels', params: { world: 'animals' } });
          }}
        >
          <Text style={animalGameSharedStyles.smallNavBtnText}>◀ Níveis</Text>
        </Pressable>

        <Text style={animalGameSharedStyles.counterText}>
          {animalIndex + 1}/{rounds.length}
        </Text>
      </View>

      {/* HUD Visual Temporário para Acompanhar a Qualidade Média do PIBO e Tempo */}
      <View style={animalGameSharedStyles.debugHud}>
        <Text style={animalGameSharedStyles.debugHudText}>
          🧠 Qualidade Média: {avgQualitySoFar ? `${Math.round(avgQualitySoFar * 100)}% (Q: ${avgQualitySoFar.toFixed(2)})` : 'Aguardando'} | Meta: ≥60% | Último: {lastAction ? `${lastAction.toUpperCase()} (Q: ${lastQuality?.toFixed(2)}, ${(lastResponseTime! / 1000).toFixed(1)}s)` : '-'} | Pts: {score}
        </Text>
      </View>

      {/* Centro: Quadro grande estático com botão de áudio no canto superior esquerdo */}
      <View style={animalGameSharedStyles.stageArea}>
        <View style={animalGameSharedStyles.bigBox}>
          {/* Botão de Áudio Dedicado no Canto Superior Esquerdo */}
          <Pressable
            style={animalGameSharedStyles.boxAudioBtn}
            onPress={() => speakWord(currentAnimal.nameEn)}
          >
            <Image
              source={require('@/assets/icons/music-on.png')}
              style={animalGameSharedStyles.boxAudioIcon}
              resizeMode="contain"
            />
          </Pressable>

          <Image
            source={require('@/assets/icons/music-on.png')}
            style={animalGameSharedStyles.listenLargeIcon}
            resizeMode="contain"
          />
          <Text style={animalGameSharedStyles.bigAnimalName}>
            &quot;{currentAnimal.nameEn}&quot;
          </Text>
        </View>
      </View>

      {/* Linha inferior: Duas opções de animais + Confirmar #d91e50 */}
      <View style={animalGameSharedStyles.bottomRow}>
        {choices.map((animal, idx) => {
          const isSelected = selectedAnimalId === animal.id;
          const isBlue = idx === 0;

          return (
            <Pressable
              key={animal.id}
              style={[
                animalGameSharedStyles.slotBase,
                isBlue
                  ? animalGameSharedStyles.slotBlue
                  : animalGameSharedStyles.slotGreen,
                isSelected && animalGameSharedStyles.slotSelected,
              ]}
              onPress={() => handleSelectAnimal(animal)}
            >
              <Text style={animalGameSharedStyles.slotEmoji}>
                {animal.emoji}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          style={[
            animalGameSharedStyles.confirmBtn,
            selectedAnimalId === null && animalGameSharedStyles.confirmBtnDisabled,
          ]}
          disabled={selectedAnimalId === null}
          onPress={handleConfirm}
        >
          <Text style={animalGameSharedStyles.confirmBtnIcon}>▶</Text>
        </Pressable>
      </View>

      {/* Flash visual translúcido na tela */}
      {flashFeedback && (
        <View
          pointerEvents="none"
          style={[
            animalGameSharedStyles.feedbackOverlay,
            flashFeedback === 'correct'
              ? animalGameSharedStyles.overlayCorrect
              : animalGameSharedStyles.overlayWrong,
          ]}
        />
      )}
    </View>
  );
}
