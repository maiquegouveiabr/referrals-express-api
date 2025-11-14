export interface Event {
  timelineItemType: string;
  contactTypeCode: string;
  eventStatus: boolean;
  lessonReview: string | null;
  lessonPlan: string | null;
  itemDate: number;
  createdByUserName: string;
  eventGuid: string;
  dropStatusId: number;
  personOfferGuid: string | null;
  offerItemId: string | null;
  subscriptionStatus: number;
  emailCampaignId: number;
}

export interface Lesson {
  id?: number | string; // some endpoints mix numeric and string IDs
  lesson?: string; // title or name of the lesson
  principles?: Principle[];
}

export interface Principle {
  description: string;
  sortOrder: number;
  lastTaught?: number; // likely a Unix timestamp (milliseconds)
  eventId: string;
  id: string;
}

export interface Referral {
  phoneNumber: string;
  referralDate: number;
  lastEvent: number | null;
  events: Event[];
  lessons: Lesson[];
  personGuid: string;
  firstName: string | null;
  lastName: string | null;
  zoneId: number | null;
  zoneName: string | null;
  districtName: string;
  areaId: number | null;
  areaName: string | null;
  createDate: number;
  personStatusId: number;
  referralStatusId: number;
  baptismDate: number | null;
  lastSacramentDate: number | null;
  sacrament: number;

  //   householdGuid: string;
  //   gender: string | null;
  //   ageCategoryId: number | null;
  //   referralStatusName: string | null;
  //   stewardCmisId: string | null;
  //   cmisId: string | null;
  //   followerCmisIdString: string | null;
  //   missionName: string;
  //   missionId: number;
  //   districtId: number;
  //   orgId: number;
  //   orgNum: number;
  //   orgName: string;
  //   address: string;
  //   phone: string | null;
  //   phoneHome: string | null;
  //   phoneMobile: string | null;
  //   phoneWork: string | null;
  //   phoneOther: string | null;
  //   email: string | null;
  //   preferredLanguageId: number;
  //   referralAssignedDate: number;
  //   localTimeZone: string | null;
  //   findId: number;
  //   offerId: number | null;
  //   lastLessonDate: number | null;
  //   statusDate: number | null;
  //   baptismGoalDate: number | null;
  //   lastTaughtByLocalDate: number | null;
  //   locId: number;
  //   stewardCmisFirstName: string | null;
  //   stewardCmisLastName: string | null;
  //   privacyNoticeStatusId: number;
  //   privacyExpirationDate: number | null;
  //   privacyNoticeDueDate: number | null;
  //   affirmedInterestDate: number | null;
  //   areaPhones: string | null;
  //   missionaryContactList: string | null;
  //   memberHideProgressDate: number | null;
  //   doNotContactDate: number | null;
  //   lastStewardChangeDate: number | null;
  //   deleted: boolean;
  //   convert: boolean;
  //   phoneMobileTextable: boolean;
  //   phoneTextable: boolean;
  //   phoneOtherTextable: boolean;
  //   phoneWorkTextable: boolean;
  //   phoneHomeTextable: boolean;
}
