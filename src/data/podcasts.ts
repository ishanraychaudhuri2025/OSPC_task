export interface PodcastEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  guest: string;
  topic: 'Purpose' | 'Leadership' | 'Trust & Teams' | 'Communication';
  duration: string;
  releaseDate: string;
  summary: string;
  officialUrl: string;
  appleUrl: string;
  spotifyUrl: string;
  keyTakeaway: string;
}

export const PODCAST_TOPICS = [
  'All',
  'Purpose',
  'Leadership',
  'Trust & Teams',
  'Communication',
] as const;

export type PodcastTopic = (typeof PODCAST_TOPICS)[number];

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: 'optimism-brene-brown',
    episodeNumber: 1,
    title: 'Vulnerability, Courage, and Trust',
    guest: 'Dr. Brené Brown',
    topic: 'Trust & Teams',
    duration: '44 min',
    releaseDate: 'Official Release',
    summary:
      'A deep exploration of why real courage requires embracing vulnerability. Simon and Brené examine how shame undermines team safety and why leaders must be willing to show uncertainty.',
    keyTakeaway: 'You cannot have genuine courage without walking through emotional vulnerability first.',
    officialUrl: 'https://simonsinek.com/podcast/',
    appleUrl: 'https://podcasts.apple.com/us/podcast/a-bit-of-optimism/id1515385282',
    spotifyUrl: 'https://open.spotify.com/show/2K01Hj0VnJ3Vpnd35zZ95P',
  },
  {
    id: 'optimism-bob-chapman',
    episodeNumber: 12,
    title: 'Truly Human Leadership',
    guest: 'Bob Chapman',
    topic: 'Leadership',
    duration: '39 min',
    releaseDate: 'Official Release',
    summary:
      'Bob Chapman, CEO of Barry-Wehmiller, shares his transformation from managing headcounts to stewarding human lives. A masterclass in creating an environment where everyone matters.',
    keyTakeaway: 'Every employee is someone’s precious child; leaders have a duty to return them home fulfilled.',
    officialUrl: 'https://simonsinek.com/podcast/',
    appleUrl: 'https://podcasts.apple.com/us/podcast/a-bit-of-optimism/id1515385282',
    spotifyUrl: 'https://open.spotify.com/show/2K01Hj0VnJ3Vpnd35zZ95P',
  },
  {
    id: 'optimism-adam-grant',
    episodeNumber: 24,
    title: 'Rethinking How We Work',
    guest: 'Adam Grant',
    topic: 'Purpose',
    duration: '48 min',
    releaseDate: 'Official Release',
    summary:
      'Organizational psychologist Adam Grant discusses the discipline of mental flexibility, challenging long-held assumptions, and why the best teams foster task conflict without relationship conflict.',
    keyTakeaway: 'Having the humility to doubt your own certainty is the cornerstone of lifelong progress.',
    officialUrl: 'https://simonsinek.com/podcast/',
    appleUrl: 'https://podcasts.apple.com/us/podcast/a-bit-of-optimism/id1515385282',
    spotifyUrl: 'https://open.spotify.com/show/2K01Hj0VnJ3Vpnd35zZ95P',
  },
  {
    id: 'optimism-julian-treasure',
    episodeNumber: 31,
    title: 'The Lost Art of Conscious Listening',
    guest: 'Julian Treasure',
    topic: 'Communication',
    duration: '38 min',
    releaseDate: 'Official Release',
    summary:
      'Sound expert Julian Treasure and Simon discuss why listening is our primary pathway to empathy, and how leaders can design physical and psychological acoustics that foster calm conversations.',
    keyTakeaway: 'Listening is not hearing words; it is creating the mental space for someone to be understood.',
    officialUrl: 'https://simonsinek.com/podcast/',
    appleUrl: 'https://podcasts.apple.com/us/podcast/a-bit-of-optimism/id1515385282',
    spotifyUrl: 'https://open.spotify.com/show/2K01Hj0VnJ3Vpnd35zZ95P',
  },
  {
    id: 'optimism-vivek-murthy',
    episodeNumber: 42,
    title: 'Together: Healing the Epidemic of Loneliness',
    guest: 'Dr. Vivek Murthy',
    topic: 'Trust & Teams',
    duration: '46 min',
    releaseDate: 'Official Release',
    summary:
      'U.S. Surgeon General Vivek Murthy joins Simon to reflect on connection as a biological imperative, examining how workplace cultures can counter chronic disconnection through small daily gestures.',
    keyTakeaway: 'Social connection is as fundamental to human resilience as food, water, and sleep.',
    officialUrl: 'https://simonsinek.com/podcast/',
    appleUrl: 'https://podcasts.apple.com/us/podcast/a-bit-of-optimism/id1515385282',
    spotifyUrl: 'https://open.spotify.com/show/2K01Hj0VnJ3Vpnd35zZ95P',
  },
  {
    id: 'optimism-arthur-brooks',
    episodeNumber: 55,
    title: 'From Strength to Strength: The Science of Purpose',
    guest: 'Arthur C. Brooks',
    topic: 'Purpose',
    duration: '45 min',
    releaseDate: 'Official Release',
    summary:
      'Harvard professor Arthur Brooks discusses transitioning from fluid intelligence to crystallized wisdom, shedding the trap of professional prestige, and discovering purpose in service.',
    keyTakeaway: 'True success in the second half of life comes from sharing wisdom rather than accumulating applause.',
    officialUrl: 'https://simonsinek.com/podcast/',
    appleUrl: 'https://podcasts.apple.com/us/podcast/a-bit-of-optimism/id1515385282',
    spotifyUrl: 'https://open.spotify.com/show/2K01Hj0VnJ3Vpnd35zZ95P',
  },
];
