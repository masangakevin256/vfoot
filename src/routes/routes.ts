import express from "express";
import { verifyRoles } from "../middleware/verifyRoles";
import { verifyJwt } from "../middleware/verifyJwt";
import {
    getAllUsers, googleAuthController, registerController, controlStepOne,
    controlStepTwo, controlStepThree,
    registerAdminController,
    getUserById,
    deleteUser
} from "../controller/controlUsers";
import { triggerStkPush, mpesaCallback } from "../controller/controlMpesa";
import { LoginUser } from "../controller/controlLogin";
import { controlReviewKyc } from "../controller/controlReviewKyc";
import { getAllCounties } from "../controller/controlCounties";
import { getCampuses } from "../controller/controlCampuses";
import { controlCreateTournament, controlGetAllTournaments, controlGetTournamentById, controlUpdateTournament, controlDeleteTournament } from "../controller/controlTournament";
import { createLeagueController, getAllLeagues, updateLeagueController, getLeagueByIdController, deleteLeagueController } from "../controller/controlLeagues";

export const router = express.Router();


//unprotected routes
router.post('/auth/login/user', LoginUser);
router.post('/auth/google', googleAuthController);
router.post('/mpesa/callback', mpesaCallback);


router.post('/users', registerController); //register new user
router.post('/users/admin', registerAdminController); //register new admin

//protected routes
router.use(verifyJwt);

router.get('/users', verifyRoles("ADMIN", "SUPER_ADMIN"), getAllUsers);
router.get('/users/:id',verifyRoles('ADMIN', 'SUPER_ADMIN', 'USER') , getUserById);
router.delete('/users/:id', verifyRoles('SUPER_ADMIN','ADMIN' ,'USER') , deleteUser);
//registration steps
router.post('/users/step1', verifyRoles('USER'), controlStepOne);
router.post('/users/step2', verifyRoles('USER'), controlStepTwo);
router.post('/users/step3', verifyRoles('USER'), controlStepThree);


//campuses and counties
router.get("/counties", verifyRoles("SUPER_ADMIN", "ADMIN", "USER"), getAllCounties);
router.get("/campuses", verifyRoles("SUPER_ADMIN", "ADMIN", "USER"), getCampuses);


//review kyc
router.post('/kyc/review', verifyRoles("ADMIN", "SUPER_ADMIN"), controlReviewKyc);

//mpesa
router.post('/stkpush', verifyRoles('SUPER_ADMIN', 'ADMIN', 'USER'), triggerStkPush);

//tournaments
router.post('/tournaments', verifyRoles('SUPER_ADMIN', 'ADMIN'), controlCreateTournament);
router.get('/tournaments', verifyRoles('SUPER_ADMIN', 'ADMIN'), controlGetAllTournaments);
router.get('/tournaments/:id', verifyRoles('SUPER_ADMIN', 'ADMIN'), controlGetTournamentById);
router.put('/tournaments/:id', verifyRoles('SUPER_ADMIN', 'ADMIN'), controlUpdateTournament);
router.delete('/tournaments/:id', verifyRoles('SUPER_ADMIN', 'ADMIN'), controlDeleteTournament);

//leagues
router.post('/leagues', verifyRoles('SUPER_ADMIN', 'ADMIN'), createLeagueController);
router.get('/leagues', verifyRoles('SUPER_ADMIN', 'ADMIN'), getAllLeagues);
router.get('/leagues/:id', verifyRoles('SUPER_ADMIN', 'ADMIN'), getLeagueByIdController);
router.put('/leagues/:id', verifyRoles('SUPER_ADMIN', 'ADMIN'), updateLeagueController);
router.delete('/leagues/:id', verifyRoles('SUPER_ADMIN', 'ADMIN'), deleteLeagueController);

