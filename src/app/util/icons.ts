import {
  faBackward, faBan,
  faBarsProgress, faBell, faBook,
  faCalendar,
  faCalendarDay,
  faCalendarDays, faCertificate, faCircleInfo, faClock, faCrown, faFilter, faForward,
  faGift, faHashtag,
  faHourglass, faKey, faLink, faLocationPin, faLock, faMedal, faMessage, faPause,
  faPeopleGroup, faPlusCircle,
  faShuffle, faStar, faStop, faTag, faTrophy, faUser,
  faWrench
} from "@fortawesome/free-solid-svg-icons";

export const icons = {

  /* app-specific terms */
  trade: faShuffle,
  volunteers: faPeopleGroup,
  rewards: faGift,
  schedule: faBarsProgress,
  event: faStar,
  activity: faStar,
  location: faLocationPin,
  invite: faMessage,
  inviteActive: faCertificate,
  inviteInactive: faLock,
  userType: faUser,
  role: faHashtag,
  signUp: faKey,
  signedUp: faCertificate,
  eligible: faCertificate,
  ineligible: faBan,
  plan: faCalendar,
  leaderboard: faTrophy,
  leaderboardFirst: faCrown,
  leaderboardPodium: faMedal,
  leaderboardOther: faCertificate,

  /* labels */
  calendar: faCalendar,
  manage: faWrench,
  name: faTag,
  shortDescription: faCircleInfo,
  longDescription: faBook,
  description: faCircleInfo,
  unavailable: faPause,
  create: faPlusCircle,
  limit: faStop,
  count: faHashtag,
  url: faLink,
  noEdit: faLock,
  filter: faFilter,
  notification: faBell,

  /* time */
  hour: faHourglass,
  day: faCalendarDay,
  date: faCalendarDays,
  startDate: faForward,
  endDate: faBackward,
  expiry: faClock,


};
