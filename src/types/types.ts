import { league } from './types';
export interface Person {
  id?: string;
  username: string;
  email: string;
  phone?: string;
  password_hash: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  is_verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface User extends Person {
  registration_status?:
  | "NOT_STARTED" //sign up local
  | "STEP_1_COMPLETED"  //personal details
  | "STEP_2_COMPLETED" //identity verification
  | "STEP_3_COMPLETED"  //campus selection and student status
  | "PAYMENT_PENDING" //wallet activation and payment
  | "PAYMENT_CONFIRMED"
  | "ACTIVE"; //fully activate account
}

export interface JwtPayload {
  id: string,
  username: string,
  email: string,
  role: "USER" | "ADMIN" | "SUPER_ADMIN"

}

export interface LoginPayload {
  email: string,
  password: string
}

export interface personalDetails {
  user_id: string,
  full_name?: string,
  pes_game_name?: string,
  team_name: string,
  konami_id: string
}

export interface tournament {
  title: string,
  type: 'campus' | 'national',
  campus_id: string,
  year: number,
  status: string,
  match_type: string,
  group_size: number,
  knockout_stages: boolean,
  rules: object
}

export interface league {
  name: 'year 1' |'year 2' | 'year 3' | 'year 4' | 'z league',
  tournament_id: string,
  
}