import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Image, Modal, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HABITAT_THEMES } from '@/data/gameData';
import { profileStyles } from '@/styles/profile';
import { speakWord, stopAllAudio } from '@/services/audioService';
import {
  getKidProfile,
  saveKidProfile,
  getGameProgress,
  resetGameProgress,
  GameProgress,
} from '@/services/storageService';

const AVAILABLE_COLORS = [
  '#4D7BF3',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#06B6D4',
  '#E11D48',
];

function generateMathQuestion() {
  const num1 = Math.floor(Math.random() * 8) + 2;
  const num2 = Math.floor(Math.random() * 8) + 2;
  return { num1, num2, answer: num1 * num2 };
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [kidName, setKidName] = useState('KidName');
  const [selectedColor, setSelectedColor] = useState('#4D7BF3');
  const [avatarEmoji, setAvatarEmoji] = useState('⭐');
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  const [isGateModalVisible, setIsGateModalVisible] = useState(false);
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [mathQuestion, setMathQuestion] = useState({ num1: 3, num2: 4, answer: 12 });
  const [mathAnswerInput, setMathAnswerInput] = useState('');
  const [mathError, setMathError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');

  useFocusEffect(
    useCallback(() => {
      getKidProfile().then((p) => {
        setKidName(p.name);
        setSelectedColor(p.avatarColor);
        setAvatarEmoji(p.avatarEmoji || '⭐');
      });
      getGameProgress().then((prog) => {
        setUnlockedIds(prog.unlockedAnimalIds);
      });
    }, [])
  );

  const handleSpeakName = () => {
    speakWord(kidName);
  };

  const handleSelectColor = async (color: string) => {
    setSelectedColor(color);
    await saveKidProfile({ avatarColor: color });
  };

  const handleSelectAnimalAvatar = async (emoji: string, nameEn: string) => {
    setAvatarEmoji(emoji);
    await saveKidProfile({ avatarEmoji: emoji });
    speakWord(nameEn);
  };

  const handleResetProgress = async () => {
    const reset = await resetGameProgress();
    setUnlockedIds(reset.unlockedAnimalIds);
    setAvatarEmoji('⭐');
    await saveKidProfile({ avatarEmoji: '⭐' });
    speakWord('Progress reset!');
  };

  const handleOpenGate = () => {
    setMathQuestion(generateMathQuestion());
    setMathAnswerInput('');
    setMathError(null);
    setIsGateModalVisible(true);
  };

  const handleVerifyMathAnswer = () => {
    const val = parseInt(mathAnswerInput.trim(), 10);
    if (val === mathQuestion.answer) {
      setIsGateModalVisible(false);
      setNameInput(kidName);
      setIsNameModalVisible(true);
    } else {
      setMathError('Resposta incorreta! Tente novamente com a nova conta.');
      setMathQuestion(generateMathQuestion());
      setMathAnswerInput('');
    }
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setKidName(trimmed);
    await saveKidProfile({ name: trimmed });
    setIsNameModalVisible(false);
    speakWord(trimmed);
  };

  return (
    <View
      style={[
        profileStyles.container,
        {
          paddingTop: Math.max(insets.top, 14),
          paddingBottom: Math.max(insets.bottom, 16),
          paddingLeft: Math.max(insets.left, 36),
          paddingRight: Math.max(insets.right, 36),
        },
      ]}
    >
      <View style={profileStyles.topBar}>
        <Pressable
          style={profileStyles.backButton}
          onPress={() => {
            stopAllAudio();
            router.back();
          }}
        >
          <Text style={profileStyles.backButtonText}>◀ Mundos</Text>
        </Pressable>
      </View>

      <View style={profileStyles.heroSection}>
        <View style={[profileStyles.bigAvatarCircle, { backgroundColor: selectedColor }]}>
          <Text style={profileStyles.bigAvatarEmoji}>{avatarEmoji}</Text>
        </View>

        <View style={profileStyles.nameContainer}>
          <Pressable style={profileStyles.nameBadgeBox} onPress={handleSpeakName}>
            <View style={profileStyles.listenBtn}>
              <Image
                source={require('@/assets/icons/music-on.png')}
                style={profileStyles.listenIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={profileStyles.kidNameText}>{kidName}</Text>
          </Pressable>

          <Pressable style={profileStyles.nameEditPencilBtn} onPress={handleOpenGate}>
            <Text style={profileStyles.pencilIconText}>✏️</Text>
          </Pressable>
        </View>
      </View>

      <View style={profileStyles.divider} />

      <ScrollView contentContainerStyle={profileStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={profileStyles.sectionTitle}>Cores:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[profileStyles.carouselRow, { paddingRight: Math.max(insets.right, 32) }]}
        >
          {AVAILABLE_COLORS.map((color) => {
            const isSelected = selectedColor === color;
            return (
              <Pressable
                key={color}
                style={[
                  profileStyles.colorCircle,
                  { backgroundColor: color },
                  isSelected && profileStyles.colorCircleSelected,
                ]}
                onPress={() => handleSelectColor(color)}
              >
                {isSelected && <Text style={profileStyles.selectedCheckmark}>✓</Text>}
              </Pressable>
            );
          })}
        </ScrollView>

        {HABITAT_THEMES.map((theme) => (
          <View key={theme.id}>
            <Text style={profileStyles.sectionTitle}>
              — {theme.nameEn} ({theme.namePt}) —
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[profileStyles.carouselRow, { paddingRight: Math.max(insets.right, 32) }]}
            >
              {theme.animals.map((animal) => {
                const isUnlocked = unlockedIds.includes(animal.id);
                const isCurrentAvatar = avatarEmoji === animal.emoji;
                return (
                  <Pressable
                    key={animal.id}
                    disabled={!isUnlocked}
                    onPress={() => isUnlocked && handleSelectAnimalAvatar(animal.emoji, animal.nameEn)}
                    style={[
                      profileStyles.lockedAnimalCircle,
                      isUnlocked && profileStyles.unlockedAnimalCircle,
                      isCurrentAvatar && profileStyles.selectedAnimalCircle,
                    ]}
                  >
                    <Text
                      style={[
                        profileStyles.lockedAnimalEmoji,
                        isUnlocked && profileStyles.unlockedAnimalEmoji,
                      ]}
                    >
                      {animal.emoji}
                    </Text>

                    {!isUnlocked && (
                      <View style={profileStyles.lockBadge}>
                        <Text style={profileStyles.lockBadgeIcon}>🔒</Text>
                      </View>
                    )}

                    {isCurrentAvatar && (
                      <View style={profileStyles.activeCheckBadge}>
                        <Text style={profileStyles.activeCheckIcon}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ))}

        <Pressable style={profileStyles.resetButton} onPress={handleResetProgress}>
          <Text style={profileStyles.resetButtonText}>🔄 Resetar Níveis e Progresso</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={isGateModalVisible} transparent animationType="fade">
        <View style={profileStyles.modalOverlay}>
          <View style={profileStyles.modalContent}>
            <Text style={profileStyles.modalTitle}>Área dos Pais 🔒</Text>
            <Text style={profileStyles.modalSubtitle}>
              Para alterar o nome da criança, resolva a conta de multiplicação:
            </Text>

            <View style={profileStyles.mathQuestionBox}>
              <Text style={profileStyles.mathQuestionText}>
                {mathQuestion.num1} × {mathQuestion.num2} = ?
              </Text>
            </View>

            <TextInput
              style={profileStyles.mathInput}
              keyboardType="number-pad"
              placeholder="Sua resposta"
              placeholderTextColor="#A08C78"
              value={mathAnswerInput}
              onChangeText={setMathAnswerInput}
              autoFocus
            />

            {mathError ? <Text style={profileStyles.errorText}>{mathError}</Text> : null}

            <View style={profileStyles.modalActions}>
              <Pressable
                style={profileStyles.modalBtnCancel}
                onPress={() => setIsGateModalVisible(false)}
              >
                <Text style={profileStyles.modalBtnCancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={profileStyles.modalBtnConfirm}
                onPress={handleVerifyMathAnswer}
              >
                <Text style={profileStyles.modalBtnConfirmText}>Verificar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isNameModalVisible} transparent animationType="fade">
        <View style={profileStyles.modalOverlay}>
          <View style={profileStyles.modalContent}>
            <Text style={profileStyles.modalTitle}>Alterar Nome ✏️</Text>
            <Text style={profileStyles.modalSubtitle}>
              Digite o novo nome da criança:
            </Text>

            <TextInput
              style={profileStyles.nameInput}
              placeholder="Nome da Criança"
              placeholderTextColor="#A08C78"
              value={nameInput}
              onChangeText={setNameInput}
              maxLength={20}
              autoFocus
            />

            <View style={profileStyles.modalActions}>
              <Pressable
                style={profileStyles.modalBtnCancel}
                onPress={() => setIsNameModalVisible(false)}
              >
                <Text style={profileStyles.modalBtnCancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={profileStyles.modalBtnConfirm}
                onPress={handleSaveName}
              >
                <Text style={profileStyles.modalBtnConfirmText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
