import { auth } from "../firebase/config";

/**
 * Smart profile navigation
 * Own profile → /profile
 * Other user → /user/:uid
 */
export function goToProfile(navigate, uid) {

  if (!uid) return;

  const currentUid = auth.currentUser?.uid;

  // If not logged in always open public
  if (!currentUid) {
    navigate(`/user/${uid}`);
    return;
  }

  // Own profile
  if (currentUid === uid) {
    navigate("/profile");
  } 
  // Other profile
  else {
    navigate(`/user/${uid}`);
  }
}
