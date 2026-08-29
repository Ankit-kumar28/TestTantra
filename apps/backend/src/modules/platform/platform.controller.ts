import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import {
  approveClub,
  rejectClub,
  suspendClub,
  restoreClub,
  listClubs,
  getClubDetails,
  getPlatformOverview
} from "./platform.service.js";
import { listClubsSchema } from "./platform.validation.js";
export async function approveClubController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId } = req.params;

  if (!clubId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CLUB_ID_REQUIRED",
        message: "Club ID is required"
      }
    });
  }

  const club = await approveClub(clubId);

  return res.status(200).json({
    success: true,
    data: {
      club
    }
  });
}

export async function rejectClubController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId } = req.params;

  if (!clubId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CLUB_ID_REQUIRED",
        message: "Club ID is required"
      }
    });
  }

  const club = await rejectClub(clubId);

  return res.status(200).json({
    success: true,
    data: {
      club
    }
  });
}

export async function suspendClubController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId } = req.params;

  if (!clubId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CLUB_ID_REQUIRED",
        message: "Club ID is required"
      }
    });
  }

  const club = await suspendClub(clubId);

  return res.status(200).json({
    success: true,
    data: {
      club
    }
  });
}


export async function restoreClubController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId } = req.params;

  if (!clubId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CLUB_ID_REQUIRED",
        message: "Club ID is required"
      }
    });
  }

  const club = await restoreClub(clubId);

  return res.status(200).json({
    success: true,
    data: {
      club
    }
  });
}


export async function listClubsController(
  req: AuthenticatedRequest,
  res: Response
) {
  const params = listClubsSchema.parse(req.query);

  const result = await listClubs(params);

  return res.status(200).json({
    success: true,
    data: result
  });
}


export async function getClubDetailsController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId } = req.params;

  if (!clubId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CLUB_ID_REQUIRED",
        message: "Club ID is required"
      }
    });
  }

  const club = await getClubDetails(clubId);

  return res.status(200).json({
    success: true,
    data: {
      club
    }
  });
}

export async function getPlatformOverviewController(
  req: AuthenticatedRequest,
  res: Response
) {
  const overview = await getPlatformOverview();

  return res.status(200).json({
    success: true,
    data: overview
  });
}