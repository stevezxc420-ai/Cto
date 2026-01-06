import { LoginRequest, SignupRequest, AuthResponse, User } from '../types/auth';

const MOCK_USERS_KEY = 'mock_users';
const MOCK_DELAY = 800;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getMockUsers = (): User[] => {
  try {
    const users = localStorage.getItem(MOCK_USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

const saveMockUser = (user: User): void => {
  const users = getMockUsers();
  users.push(user);
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const generateToken = (): string => {
  return `mock_token_${Math.random().toString(36).substring(2, 15)}`;
};

export const mockAuthAPI = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    await delay(MOCK_DELAY);
    
    const users = getMockUsers();
    const user = users.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Invalid credentials. No account found with this email.');
    }
    
    return {
      user,
      token: generateToken(),
      refreshToken: generateToken(),
      expiresIn: credentials.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    };
  },

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    await delay(MOCK_DELAY);
    
    const users = getMockUsers();
    const existingUser = users.find(u => u.email === userData.email);
    
    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: userData.email,
      name: userData.name,
    };
    
    saveMockUser(newUser);
    
    return {
      user: newUser,
      token: generateToken(),
      refreshToken: generateToken(),
      expiresIn: 24 * 60 * 60 * 1000,
    };
  },
};
