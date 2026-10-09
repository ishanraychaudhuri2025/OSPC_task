export interface TopicItem {
  id: string;
  title: string;
  category: 'Purpose' | 'Leadership' | 'Trust & Teams' | 'Infinite Mindset';
  summary: string;
  practicePrompt: string;
  sourceLabel: string;
  sourceUrl: string;
  readTime: string;
  referencePublication?: string;
}

export const TOPIC_CATEGORIES = [
  'All',
  'Purpose',
  'Leadership',
  'Trust & Teams',
  'Infinite Mindset',
] as const;

export type TopicCategory = (typeof TOPIC_CATEGORIES)[number];

export const TOPICS: TopicItem[] = [
  {
    id: 'golden-circle',
    title: 'The Golden Circle',
    category: 'Purpose',
    summary:
      'A framework mapping clarity from the inside out: Why (purpose), How (guiding values), and What (visible outcomes). When the core motivation is articulate, action becomes coherent.',
    practicePrompt:
      'Write down your current project in one sentence starting with "We exist to..." before listing what you actually produce.',
    sourceLabel: 'Official Purpose Statement',
    sourceUrl: 'https://simonsinek.com/our-why/',
    readTime: '3 min reflection',
    referencePublication: 'Core Philosophy',
  },
  {
    id: 'start-with-why',
    title: 'Start With Why',
    category: 'Purpose',
    summary:
      'Explores how enduring loyalty and voluntary cooperation stem from shared beliefs rather than transactional incentives or external pressure.',
    practicePrompt:
      'In your next team kickoff or proposal, spend the first five minutes explaining why the challenge matters before discussing the deadline.',
    sourceLabel: 'Official Book Reference',
    sourceUrl: 'https://simonsinek.com/books/start-with-why',
    readTime: '4 min reflection',
    referencePublication: 'Start with Why (2009)',
  },
  {
    id: 'circle-of-safety',
    title: 'The Circle of Safety',
    category: 'Trust & Teams',
    summary:
      'When an organization reduces internal fear, blame, and political anxiety, team members can redirect their natural defensive instincts toward collaboration and mutual care.',
    practicePrompt:
      'Identify one recurring meeting where questions are rarely asked. Ask yourself: what makes disagreement feel risky there?',
    sourceLabel: 'Official Books Index',
    sourceUrl: 'https://simonsinek.com/books',
    readTime: '4 min reflection',
    referencePublication: 'Leaders Eat Last (2014)',
  },
  {
    id: 'leaders-eat-last',
    title: 'Leaders Eat Last',
    category: 'Leadership',
    summary:
      'Examines leadership as voluntary sacrifice and stewardship rather than positional privilege. Authority is sustained by taking care of those doing the work.',
    practicePrompt:
      'Look for an opportunity this week to absorb an administrative friction so a collaborator can focus on high-impact thinking.',
    sourceLabel: 'Official Books Index',
    sourceUrl: 'https://simonsinek.com/books',
    readTime: '5 min reflection',
    referencePublication: 'Leaders Eat Last (2014)',
  },
  {
    id: 'infinite-game',
    title: 'The Infinite Game',
    category: 'Infinite Mindset',
    summary:
      'Business and meaningful human endeavors have no final buzzer, fixed rules, or agreed winners. The objective is to keep playing with vitality, integrity, and trust.',
    practicePrompt:
      'When tempted to benchmark yourself against a rival, reframe the question: "How can our team stay resilient and true to our purpose ten years from now?"',
    sourceLabel: 'Official Books Index',
    sourceUrl: 'https://simonsinek.com/books',
    readTime: '4 min reflection',
    referencePublication: 'The Infinite Game (2019)',
  },
  {
    id: 'just-cause',
    title: 'A Just Cause',
    category: 'Infinite Mindset',
    summary:
      'An inspiring vision of a future state that does not yet exist, for which people are willing to sacrifice personal comfort in order to advance something greater than themselves.',
    practicePrompt:
      'Test your organization’s mission: is it affirmative, resilient to market shifts, and open to all who share the belief?',
    sourceLabel: 'Official Books Index',
    sourceUrl: 'https://simonsinek.com/books',
    readTime: '3 min reflection',
    referencePublication: 'The Infinite Game (2019)',
  },
  {
    id: 'listen-to-understand',
    title: 'Active Listening & Empathy',
    category: 'Leadership',
    summary:
      'True leadership listens not to respond, correct, or refute, but to understand the human condition behind the perspective.',
    practicePrompt:
      'In your next one-on-one, let the other person finish their thought completely, pause for two seconds, and ask: "Can you tell me more about that?"',
    sourceLabel: 'Official Website',
    sourceUrl: 'https://simonsinek.com/',
    readTime: '3 min reflection',
    referencePublication: 'Foundational Practice',
  },
  {
    id: 'courage-to-lead',
    title: 'Existential Flexibility',
    category: 'Trust & Teams',
    summary:
      'The capacity for a leader or group to initiate an extreme strategic pivot in pursuit of a just cause, demonstrating that purpose precedes established habits.',
    practicePrompt:
      'Review a process your team protects out of habit. If starting fresh today with only your core purpose, would you still build it this way?',
    sourceLabel: 'Official Books Index',
    sourceUrl: 'https://simonsinek.com/books',
    readTime: '4 min reflection',
    referencePublication: 'The Infinite Game (2019)',
  },
];
