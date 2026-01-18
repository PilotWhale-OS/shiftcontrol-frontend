import {
  faBackward, faBan,
  faBarsProgress, faBell, faBook,
  faCalendar,
  faCalendarDay,
  faCalendarDays, faCaretSquareUp, faCertificate, faChartGantt, faCheckCircle, faCircleInfo, faClock, faCrown, faFilter, faForward,
  faGift, faHashtag,
  faHourglass, faKey, faLink, faLocationPin, faLock, faMedal, faMessage, faMoon, faPause,
  faPeopleGroup, faPlusCircle,
  faShuffle, faStar, faStop, faTableColumns, faTag, faTrophy, faUser,
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
  assigned: faCheckCircle,
  unassigned: faBan,
  eligible: faCertificate,
  ineligible: faBan,
  plan: faTableColumns,
  phase: faChartGantt,
  leaderboard: faTrophy,
  leaderboardFirst: faCrown,
  leaderboardPodium: faMedal,
  leaderboardOther: faCertificate,
  position: faWrench,
  shift: faClock,

  /* labels */
  calendar: faCalendar,
  manage: faWrench,
  name: faTag,
  shortDescription: faCircleInfo,
  longDescription: faBook,
  description: faCircleInfo,
  unavailable: faPause,
  create: faPlusCircle,
  limit: faCaretSquareUp,
  count: faHashtag,
  url: faLink,
  noEdit: faLock,
  filter: faFilter,
  notification: faBell,
  noNotification: faMoon,
  info: faCircleInfo,

  /* time */
  hour: faHourglass,
  day: faCalendarDay,
  date: faCalendarDays,
  startDate: faForward,
  endDate: faBackward,
  expiry: faClock,


};
