import { ImageSourcePropType } from 'react-native';

export interface AnimalItem {
  id: string;
  nameEn: string;
  namePt: string;
  emoji: string;
  habitatId: string;
  image?: ImageSourcePropType;
}

export interface HabitatTheme {
  id: string;
  level: 1 | 2 | 3;
  nameEn: string;
  namePt: string;
  emoji: string;
  color: string;
  image?: ImageSourcePropType;
  animals: AnimalItem[];
}

export const ANIMAL_THEMES: HabitatTheme[] = [
  {
    id: 'farm',
    level: 1,
    nameEn: 'Farm',
    namePt: 'Fazenda',
    emoji: '🚜',
    color: '#E76F51',
    animals: [
      { id: 'cow', nameEn: 'Cow', namePt: 'Vaca', emoji: '🐄', habitatId: 'farm' },
      { id: 'chicken', nameEn: 'Chicken', namePt: 'Galinha', emoji: '🐔', habitatId: 'farm' },
      { id: 'horse', nameEn: 'Horse', namePt: 'Cavalo', emoji: '🐎', habitatId: 'farm' },
      { id: 'pig', nameEn: 'Pig', namePt: 'Porco', emoji: '🐖', habitatId: 'farm' },
      { id: 'duck', nameEn: 'Duck', namePt: 'Pato', emoji: '🦆', habitatId: 'farm' },
      { id: 'rooster', nameEn: 'Rooster', namePt: 'Galo', emoji: '🐓', habitatId: 'farm' },
    ],
  },
  {
    id: 'pets',
    level: 1,
    nameEn: 'Pets',
    namePt: 'Domésticos',
    emoji: '🏠',
    color: '#F4A261',
    animals: [
      { id: 'dog', nameEn: 'Dog', namePt: 'Cão', emoji: '🐶', habitatId: 'pets' },
      { id: 'cat', nameEn: 'Cat', namePt: 'Gato', emoji: '🐱', habitatId: 'pets' },
      { id: 'bird', nameEn: 'Bird', namePt: 'Pássaro', emoji: '🐦', habitatId: 'pets' },
      { id: 'hamster', nameEn: 'Hamster', namePt: 'Hamster', emoji: '🐹', habitatId: 'pets' },
    ],
  },

  {
    id: 'forest',
    level: 2,
    nameEn: 'Forest',
    namePt: 'Floresta',
    emoji: '🌲',
    color: '#52B788',
    animals: [
      { id: 'rabbit', nameEn: 'Rabbit', namePt: 'Coelho', emoji: '🐰', habitatId: 'forest' },
      { id: 'snake', nameEn: 'Snake', namePt: 'Cobra', emoji: '🐍', habitatId: 'forest' },
      { id: 'bear', nameEn: 'Bear', namePt: 'Urso', emoji: '🐻', habitatId: 'forest' },
      { id: 'squirrel', nameEn: 'Squirrel', namePt: 'Esquilo', emoji: '🐿️', habitatId: 'forest' },
      { id: 'owl', nameEn: 'Owl', namePt: 'Coruja', emoji: '🦉', habitatId: 'forest' },
      { id: 'mouse', nameEn: 'Mouse', namePt: 'Rato', emoji: '🐭', habitatId: 'forest' },
    ],
  },
  {
    id: 'garden',
    level: 2,
    nameEn: 'Garden',
    namePt: 'Insetos / Jardim',
    emoji: '🌻',
    color: '#2A9D8F',
    animals: [
      { id: 'butterfly', nameEn: 'Butterfly', namePt: 'Borboleta', emoji: '🦋', habitatId: 'garden' },
      { id: 'frog', nameEn: 'Frog', namePt: 'Sapo', emoji: '🐸', habitatId: 'garden' },
      { id: 'bee', nameEn: 'Bee', namePt: 'Abelha', emoji: '🐝', habitatId: 'garden' },
      { id: 'cricket', nameEn: 'Cricket', namePt: 'Grilo', emoji: '🦗', habitatId: 'garden' },
      { id: 'ladybug', nameEn: 'Ladybug', namePt: 'Joaninha', emoji: '🐞', habitatId: 'garden' },
      { id: 'ant', nameEn: 'Ant', namePt: 'Formiga', emoji: '🐜', habitatId: 'garden' },
    ],
  },

  {
    id: 'savannah',
    level: 3,
    nameEn: 'Savannah',
    namePt: 'Savana',
    emoji: '🌍',
    color: '#E9C46A',
    animals: [
      { id: 'lion', nameEn: 'Lion', namePt: 'Leão', emoji: '🦁', habitatId: 'savannah' },
      { id: 'elephant', nameEn: 'Elephant', namePt: 'Elefante', emoji: '🐘', habitatId: 'savannah' },
      { id: 'zebra', nameEn: 'Zebra', namePt: 'Zebra', emoji: '🦓', habitatId: 'savannah' },
      { id: 'giraffe', nameEn: 'Giraffe', namePt: 'Girafa', emoji: '🦒', habitatId: 'savannah' },
      { id: 'hippo', nameEn: 'Hippo', namePt: 'Hipopótamo', emoji: '🦛', habitatId: 'savannah' },
      { id: 'tiger', nameEn: 'Tiger', namePt: 'Tigre', emoji: '🐯', habitatId: 'savannah' },
      { id: 'monkey', nameEn: 'Monkey', namePt: 'Macaco', emoji: '🐒', habitatId: 'savannah' },
    ],
  },
  {
    id: 'ocean',
    level: 3,
    nameEn: 'Ocean',
    namePt: 'Oceano',
    emoji: '🌊',
    color: '#3B82F6',
    animals: [
      { id: 'fish', nameEn: 'Fish', namePt: 'Peixe', emoji: '🐠', habitatId: 'ocean' },
      { id: 'shark', nameEn: 'Shark', namePt: 'Tubarão', emoji: '🦈', habitatId: 'ocean' },
      { id: 'whale', nameEn: 'Whale', namePt: 'Baleia', emoji: '🐋', habitatId: 'ocean' },
      { id: 'dolphin', nameEn: 'Dolphin', namePt: 'Golfinho', emoji: '🐬', habitatId: 'ocean' },
      { id: 'seal', nameEn: 'Seal', namePt: 'Foca', emoji: '🦭', habitatId: 'ocean' },
    ],
  },
];

export const HABITAT_THEMES: HabitatTheme[] = [
  {
    id: 'farm',
    level: 1,
    nameEn: 'Farm',
    namePt: 'Fazenda',
    emoji: '🚜',
    color: '#E76F51',
    image: require('@/assets/icons/farm.jpg'),
    animals: [
      { id: 'cow', nameEn: 'Cow', namePt: 'Vaca', emoji: '🐄', habitatId: 'farm' },
      { id: 'chicken', nameEn: 'Chicken', namePt: 'Galinha', emoji: '🐔', habitatId: 'farm' },
      { id: 'horse', nameEn: 'Horse', namePt: 'Cavalo', emoji: '🐎', habitatId: 'farm' },
      { id: 'pig', nameEn: 'Pig', namePt: 'Porco', emoji: '🐖', habitatId: 'farm' },
      { id: 'duck', nameEn: 'Duck', namePt: 'Pato', emoji: '🦆', habitatId: 'farm' },
      { id: 'rooster', nameEn: 'Rooster', namePt: 'Galo', emoji: '🐓', habitatId: 'farm' },
    ],
  },
  {
    id: 'home',
    level: 1,
    nameEn: 'Home',
    namePt: 'Domésticos',
    emoji: '🏠',
    color: '#F4A261',
    image: require('@/assets/icons/home.jpg'),
    animals: [
      { id: 'dog', nameEn: 'Dog', namePt: 'Cão', emoji: '🐶', habitatId: 'home' },
      { id: 'cat', nameEn: 'Cat', namePt: 'Gato', emoji: '🐱', habitatId: 'home' },
      { id: 'bird', nameEn: 'Bird', namePt: 'Pássaro', emoji: '🐦', habitatId: 'home' },
      { id: 'hamster', nameEn: 'Hamster', namePt: 'Hamster', emoji: '🐹', habitatId: 'home' },
    ],
  },

  {
    id: 'forest',
    level: 2,
    nameEn: 'Forest',
    namePt: 'Floresta',
    emoji: '🌲',
    color: '#52B788',
    image: require('@/assets/icons/forest.jpg'),
    animals: [
      { id: 'rabbit', nameEn: 'Rabbit', namePt: 'Coelho', emoji: '🐰', habitatId: 'forest' },
      { id: 'snake', nameEn: 'Snake', namePt: 'Cobra', emoji: '🐍', habitatId: 'forest' },
      { id: 'bear', nameEn: 'Bear', namePt: 'Urso', emoji: '🐻', habitatId: 'forest' },
      { id: 'squirrel', nameEn: 'Squirrel', namePt: 'Esquilo', emoji: '🐿️', habitatId: 'forest' },
      { id: 'owl', nameEn: 'Owl', namePt: 'Coruja', emoji: '🦉', habitatId: 'forest' },
      { id: 'mouse', nameEn: 'Mouse', namePt: 'Rato', emoji: '🐭', habitatId: 'forest' },
    ],
  },
  {
    id: 'garden',
    level: 2,
    nameEn: 'Garden',
    namePt: 'Insetos / Jardim',
    emoji: '🌻',
    color: '#2A9D8F',
    image: require('@/assets/icons/garden.jpg'),
    animals: [
      { id: 'butterfly', nameEn: 'Butterfly', namePt: 'Borboleta', emoji: '🦋', habitatId: 'garden' },
      { id: 'frog', nameEn: 'Frog', namePt: 'Sapo', emoji: '🐸', habitatId: 'garden' },
      { id: 'bee', nameEn: 'Bee', namePt: 'Abelha', emoji: '🐝', habitatId: 'garden' },
      { id: 'cricket', nameEn: 'Cricket', namePt: 'Grilo', emoji: '🦗', habitatId: 'garden' },
      { id: 'ladybug', nameEn: 'Ladybug', namePt: 'Joaninha', emoji: '🐞', habitatId: 'garden' },
      { id: 'ant', nameEn: 'Ant', namePt: 'Formiga', emoji: '🐜', habitatId: 'garden' },
    ],
  },

  {
    id: 'savannah',
    level: 3,
    nameEn: 'Savannah',
    namePt: 'Savana',
    emoji: '🌍',
    color: '#E9C46A',
    image: require('@/assets/icons/savannah.jpg'),
    animals: [
      { id: 'lion', nameEn: 'Lion', namePt: 'Leão', emoji: '🦁', habitatId: 'savannah' },
      { id: 'elephant', nameEn: 'Elephant', namePt: 'Elefante', emoji: '🐘', habitatId: 'savannah' },
      { id: 'zebra', nameEn: 'Zebra', namePt: 'Zebra', emoji: '🦓', habitatId: 'savannah' },
      { id: 'giraffe', nameEn: 'Giraffe', namePt: 'Girafa', emoji: '🦒', habitatId: 'savannah' },
      { id: 'hippo', nameEn: 'Hippo', namePt: 'Hipopótamo', emoji: '🦛', habitatId: 'savannah' },
      { id: 'tiger', nameEn: 'Tiger', namePt: 'Tigre', emoji: '🐯', habitatId: 'savannah' },
      { id: 'monkey', nameEn: 'Monkey', namePt: 'Macaco', emoji: '🐒', habitatId: 'savannah' },
    ],
  },
  {
    id: 'sea',
    level: 3,
    nameEn: 'Ocean',
    namePt: 'Oceano',
    emoji: '🌊',
    color: '#3B82F6',
    image: require('@/assets/icons/sea.jpg'),
    animals: [
      { id: 'fish', nameEn: 'Fish', namePt: 'Peixe', emoji: '🐠', habitatId: 'sea' },
      { id: 'shark', nameEn: 'Shark', namePt: 'Tubarão', emoji: '🦈', habitatId: 'sea' },
      { id: 'whale', nameEn: 'Whale', namePt: 'Baleia', emoji: '🐋', habitatId: 'sea' },
      { id: 'dolphin', nameEn: 'Dolphin', namePt: 'Golfinho', emoji: '🐬', habitatId: 'sea' },
      { id: 'seal', nameEn: 'Seal', namePt: 'Foca', emoji: '🦭', habitatId: 'sea' },
    ],
  },
];

export function getAnimalThemeById(id?: string): HabitatTheme {
  return ANIMAL_THEMES.find((item) => item.id === id) ?? ANIMAL_THEMES[0];
}

export function getHabitatThemeById(id?: string): HabitatTheme {
  return HABITAT_THEMES.find((item) => item.id === id) ?? HABITAT_THEMES[0];
}

export function getThemeById(id?: string, world: 'animals' | 'habitats' = 'animals'): HabitatTheme {
  if (world === 'habitats') {
    return getHabitatThemeById(id);
  }
  return getAnimalThemeById(id);
}
