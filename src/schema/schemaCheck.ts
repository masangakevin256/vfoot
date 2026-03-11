import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  username: z.string().min(3).max(50),
  email: z.string().email().max(120),
  phone: z.string().max(20).optional(),
  password: z.string(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).default("USER"),
  registration_status: z.enum([
    "NOT_STARTED",
    "STEP_1_COMPLETED",
    "STEP_2_COMPLETED",
    "KYC_APPROVED",
    "KYC_REJECTED",
    "STEP_3_COMPLETED",
    "PAYMENT_PENDING",
    "PAYMENT_CONFIRMED",
    "ACTIVE"
  ]).default("NOT_STARTED"),
  secret_code: z.string().optional(),
  is_verified: z.boolean().default(false),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});

export const step1SubmissionSchema =  z.object({

  user_id: z.string().uuid(),
  full_name: z.string().optional(),
  pes_game_name: z.string().optional(),
  team_name: z.string(),
  konami_id: z.string(),
  konami_username: z.string().optional()
})

export const step2SubmissionSchema = z.object({
  user_id: z.string().uuid(),
  id_front_url: z.string(),
  id_back_url: z.string(),
  selfie_url: z.string(),
  date_of_birth: z.string(),
  nationality: z.string(),
  status: z.enum(["ACTIVE", "PENDING"]).default("PENDING")
}) 

export const step3SubmissionSchema = z.object({
  user_id: z.string().uuid(),
  county_code: z.number(),
  campus_id: z.string().uuid(),
  registration_number: z.string().min(3),
  year_of_study: z.number().int().min(1).max(10),
  department: z.string().min(2),
  invitation_code: z.string().optional(),
  id_number: z.string().min(5)
});

export const mpesaStkPayload = z.object({
 
      BusinessShortCode: z.string().min(4),            
      Password: z.string().min(4),
      Timestamp: z.string(),
      TransactionType: z.string(),        
      Amount: z.number().int().min(1),
      PartyA: z.string().min(10),                          
      PartyB: z.string().min(3),             
      PhoneNumber: z.string().min(10),                     
      CallBackURL: z.string(),            
      AccountReference: z.string(),          
      TransactionDesc: z.string(),                 
    

})

export const mpesaPaymentTriggerSchema = z.object({
  user_id: z.string().uuid(),
  amount: z.number().positive(),
  phone: z.string().min(10)
})

//optional for update
export const tournamentSchema = z.object({
  title: z.string().optional(),
  type: z.enum(["campus", "national"]).optional(),
  campus_id: z.string().uuid().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  status: z.enum(["upcoming", "ongoing", "completed"]).optional(),
  match_type: z.string().optional(),
  group_size: z.number().int().min(2).max(10).optional(),
  knockout_stages: z.boolean().optional(),
  rules: z.object({}).optional()
})

//optional for update
export const leaguesSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional(),
  campus_id: z.string().uuid().optional(),
  category: z.enum(["year 1", "year 2", "year 3", "year 4", "z league"]).optional(),
  season: z.number().int().positive().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  status: z.enum(["REGISTRATION_OPEN", "REGISTRATION_CLOSED", "PLAY_OFF", "FINAL"]).optional(),
  max_players: z.number().int().positive().optional(),
  start_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).transform(val => new Date(val)).optional(),
  end_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).transform(val => new Date(val)).optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
})

export const leaguePlayersSchema = z.object({
  id: z.string().uuid().optional(),
  league_id: z.string().uuid(),
  user_id: z.string().uuid(),
  matches_played: z.number().int().min(0),
  wins: z.number().int().min(0),
  draws: z.number().int().min(0),
  losses: z.number().int().min(0),
  goals_for: z.number().int().min(0),
  goals_against: z.number().int().min(0),
  points: z.number().int().min(0),
  joined_at: z.date(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
})
