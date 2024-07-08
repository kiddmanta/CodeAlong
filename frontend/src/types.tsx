type User = {
  _id: string;
  username: string;
  email: string;
  password: string;
  refreshToken?: string;
};

type Playground = {
  _id: string;
  name: string;
  code: string;
  createdBy: string;
  language: string;
  participatedUsers: string[];
  input: string;
  roomId: string;
  createdAt: string;
  isActive: boolean;
};

type Token = {
  token: string;
  refreshToken: string;
};

export type { User, Playground, Token };
