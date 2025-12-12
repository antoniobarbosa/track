import fushimiImg from '@assets/stock_images/fushimi_inari_shrine_e6a0499f.jpg';
import bambooImg from '@assets/stock_images/serene_bamboo_forest_38289e3e.jpg';
import kyotoNightImg from '@assets/stock_images/cinematic_shot_of_ky_e5492d1c.jpg';
import travelerImg from '@assets/stock_images/modern_traveler_look_cd8c6f01.jpg';

export type Category = 'culture' | 'food' | 'nature' | 'shopping' | 'stay';
export type Difficulty = 'easy' | 'moderate' | 'challenging';

export interface Location {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  category: Category;
  difficulty?: Difficulty;
  photos: string[];
  time: string;
  day: number;
  rating: number;
}

export const MOCK_TRIP = {
  id: 'trip-kyoto-2025',
  title: 'Kyoto & Osaka: The Soul of Japan',
  dates: 'Oct 12 - Oct 18, 2025',
  stats: {
    distance: '45km',
    places: 14,
    photos: 342,
  },
  locations: [
    {
      id: 'loc-1',
      name: 'Fushimi Inari Taisha',
      description: 'Famous for its thousands of vermilion torii gates, which straddle a network of trails behind its main buildings.',
      lat: 34.9671,
      lng: 135.7727,
      category: 'culture',
      difficulty: 'moderate',
      photos: [fushimiImg],
      time: '08:00 AM',
      day: 1,
      rating: 4.9
    },
    {
      id: 'loc-2',
      name: 'Arashiyama Bamboo Grove',
      description: 'A mesmerizing grove of giant bamboo stalks. The walking paths that cut through the bamboo groves make for a nice walk.',
      lat: 35.0094,
      lng: 135.6670,
      category: 'nature',
      difficulty: 'easy',
      photos: [bambooImg],
      time: '11:30 AM',
      day: 1,
      rating: 4.8
    },
    {
      id: 'loc-3',
      name: 'Pontocho Alley',
      description: 'A narrow alley running from Shijo-dori to Sanjo-dori, one of Kyoto\'s most atmospheric dining areas.',
      lat: 35.0063,
      lng: 135.7716,
      category: 'food',
      difficulty: 'easy',
      photos: [kyotoNightImg],
      time: '07:00 PM',
      day: 1,
      rating: 4.7
    },
    {
      id: 'loc-4',
      name: 'Kinkaku-ji',
      description: 'The Golden Pavilion. A Zen temple whose top two floors are completely covered in gold leaf.',
      lat: 35.0394,
      lng: 135.7292,
      category: 'culture',
      difficulty: 'easy',
      photos: [travelerImg],
      time: '10:00 AM',
      day: 2,
      rating: 4.9
    },
    {
      id: 'loc-5',
      name: 'Nishiki Market',
      description: 'Known as "Kyoto\'s Kitchen", this narrow, five block long shopping street is lined by more than one hundred shops and restaurants.',
      lat: 35.0050,
      lng: 135.7633,
      category: 'food',
      difficulty: 'easy',
      photos: [fushimiImg], 
      time: '01:00 PM',
      day: 2,
      rating: 4.6
    }
  ] as Location[]
};
