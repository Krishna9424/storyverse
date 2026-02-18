import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { updateProfile } from "firebase/auth";
import { onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../Styles/profile.css";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


export default function Profile() {

  const navigate = useNavigate();
  const storage = getStorage();

  /* ================= MAIN PROFILE STATE ================= */
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("reader");
  const [dob, setDob] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  /* ================= EDIT MODAL STATE ================= */
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editRole, setEditRole] = useState("reader");
  const [editDob, setEditDob] = useState("");

  /* ================= OTHER STATE ================= */
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myStories, setMyStories] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [showFollowers, setShowFollowers] = useState(false);
const [followersList, setFollowersList] = useState([]);

const [showFollowing, setShowFollowing] = useState(false);   
const [followingList, setFollowingList] = useState([]);      
const [showFollowSection, setShowFollowSection] = useState(false);
const [activeTab, setActiveTab] = useState("followers");


const [searchTerm, setSearchTerm] = useState("");




  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;

      const ref = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setBio(data.bio || "");
        setRole(data.role || "reader");
        setDob(data.dob || "");
        setPhotoURL(data.photoURL || "");
      }
    };

    fetchProfile();
  }, []);
const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !auth.currentUser) return;

  try {
    const storageRef = ref(storage, `profilePhotos/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);

    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        photoURL: downloadURL,
        createdAt: new Date(),
      });
    } else {
      await updateDoc(userRef, {
        photoURL: downloadURL,
      });
    }

    setPhotoURL(downloadURL);

  } catch (err) {
    console.error("Upload Error:", err);
  }
};


  /* ================= FETCH STORIES ================= */
  useEffect(() => {
    const fetchStories = async () => {
      if (!auth.currentUser) return;

      const q = query(
        collection(db, "stories"),
        where("authorId", "==", auth.currentUser.uid)
      );

      const snap = await getDocs(q);
      setMyStories(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };

    fetchStories();
  }, []);

  /* ================= FETCH FOLLOWERS ================= */
  

useEffect(() => {
  if (!auth.currentUser) return;

  const followersQ = query(
    collection(db, "followers"),
    where("followingId", "==", auth.currentUser.uid)
  );

  const followingQ = query(
    collection(db, "followers"),
    where("followerId", "==", auth.currentUser.uid)
  );

  const unsubscribeFollowers = onSnapshot(followersQ, (snapshot) => {
    setFollowersCount(snapshot.size);
  });

  const unsubscribeFollowing = onSnapshot(followingQ, (snapshot) => {
    setFollowingCount(snapshot.size);
  });

  return () => {
    unsubscribeFollowers();
    unsubscribeFollowing();
  };
}, []);

const fetchFollowersList = async () => {
  const q = query(
    collection(db, "followers"),
    where("followingId", "==", auth.currentUser.uid)
  );

  const snap = await getDocs(q);

  const ids = snap.docs.map((doc) => doc.data().followerId);

  const usersData = await Promise.all(
    ids.map((id) => getDoc(doc(db, "users", id)))
  );

  const finalUsers = usersData
    .filter((u) => u.exists())
    .map((u) => ({ id: u.id, ...u.data() }));

  setFollowersList(finalUsers);
};


const fetchFollowingList = async () => {
  if (!auth.currentUser) return;

  const q = query(
    collection(db, "followers"),
    where("followerId", "==", auth.currentUser.uid)
  );

  const snap = await getDocs(q);

  const ids = snap.docs.map((doc) => doc.data().followingId);

  const usersData = await Promise.all(
    ids.map((id) => getDoc(doc(db, "users", id)))
  );

  const finalUsers = usersData
    .filter((u) => u.exists())
    .map((u) => ({ id: u.id, ...u.data() }));

  setFollowingList(finalUsers);
};

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
  if (!auth.currentUser) return;

  try {
    setSaving(true);

    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Agar document nahi hai to create karo
      await setDoc(userRef, {
        name: editName,
        bio: editBio,
        role: editRole,
        dob: editDob,
        photoURL: photoURL || "",
        createdAt: new Date(),
      });
    } else {
      // Agar document already hai to update karo
      await updateDoc(userRef, {
        name: editName,
        bio: editBio,
        role: editRole,
        dob: editDob,
        photoURL: photoURL || "",
      });
    }

    // Local state update
    setName(editName);
    setBio(editBio);
    setRole(editRole);
    setDob(editDob);

    setShowEdit(false);

  } catch (error) {
    console.error("Update Error:", error);
  } finally {
    setSaving(false);
  }
};



  /* ================= DELETE STORY ================= */
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "stories", id));
    setMyStories((prev) => prev.filter((s) => s.id !== id));
  };
/*================== LOGOUT============*/
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");   // agar tera login route alag hai to wo likh
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
const handleBack = () => {
  navigate(-1); // previous page pe le jayega
};


  return (
  <div className="profile-wrapper">
    <button className="back-btn" onClick={handleBack}>
  ←
</button>

    <div className="profile-layout">

      {/* ================= LEFT PANEL ================= */}
      <div className="profile-left">
        <div className="profile-cover" />

        <div className="profile-avatar-wrapper">
          {photoURL ? (
            <img src={photoURL} alt="profile" />
          ) : (
            <div className="profile-avatar">
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
        </div>

        <h2 className="profile-name">{name}</h2>

        <div className="profile-role-badge">
          {role === "writer" ? "Writer ✦" : "Reader"}
        </div>

        <p className="profile-bio">
          {bio || "Add your bio"}
        </p>

        {/* ================= FOLLOW STATS ================= */}
        <div className="profile-stats">

          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              setShowFollowSection(true);
              setActiveTab("followers");
              fetchFollowersList();
            }}
          >
            <strong>{followersCount}</strong>
            <span>Followers</span>
          </div>

          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              setShowFollowSection(true);
              setActiveTab("following");
              fetchFollowingList();
            }}
          >
            <strong>{followingCount}</strong>
            <span>Following</span>
          </div>

        </div>

        <button
          className="edit-btn"
          onClick={() => {
            setEditName(name);
            setEditBio(bio);
            setEditRole(role);
            setEditDob(dob);
            setShowEdit(true);
          }}
        >
          Edit Profile
        </button>
        <button className="logout-btn" onClick={handleLogout}>
  Logout
</button>

      </div>


      {/* ================= RIGHT PANEL ================= */}
      <div className="profile-right">
        <h3>Your Stories</h3>

        <div className="stories-grid">
          {myStories.map((story) => (
            <div key={story.id} className="story-card">
              <h4>{story.title || "Untitled"}</h4>

              <p>
                {(story.content || "")
                  .replace(/<[^>]+>/g, "")
                  .slice(0, 80)}...
              </p>

              <div className="story-actions">
                <button
                  onClick={() =>
                    navigate(`/write/editor?edit=${story.id}`)
                  }
                >
                  Edit
                </button>

                <button
                  className="danger"
                  onClick={() => handleDelete(story.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>


    {/* ================= FOLLOW SECTION (TABS) ================= */}
   {/* ================= FOLLOW MODAL ================= */}
{showFollowSection && (
  <div className="follow-modal">
    <div className="follow-box">

      <div className="follow-header">
        <button
          className={activeTab === "followers" ? "active" : ""}
          onClick={() => {
            setActiveTab("followers");
            fetchFollowersList();
          }}
        >
          Followers
        </button>

        <button
          className={activeTab === "following" ? "active" : ""}
          onClick={() => {
            setActiveTab("following");
            fetchFollowingList();
          }}
        >
          Following
        </button>

        <span
          className="close-follow"
          onClick={() => setShowFollowSection(false)}
        >
          ✕
        </span>
      </div>

      <input
        type="text"
        placeholder="Search people..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="follow-search"
      />

      <div className="follow-list">
        {(activeTab === "followers"
          ? followersList
          : followingList
        )
          .filter((u) =>
            u.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((user) => (
            <div key={user.id} className="follow-item">
              <div className="follow-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" />
                ) : (
                  user.name?.charAt(0)?.toUpperCase()
                )}
              </div>
              <span>{user.name}</span>
            </div>
          ))}
      </div>

    </div>
  </div>
)}


    {/* ================= EDIT MODAL ================= */}
    {showEdit && (
      <div className="edit-modal">
        <div className="edit-box">
          <h3>Edit Profile</h3>

          <div className="edit-avatar-preview">
            {photoURL ? (
              <img src={photoURL} alt="preview" />
            ) : (
              <div className="edit-avatar-placeholder">
                {editName?.charAt(0)?.toUpperCase()}
              </div>
            )}

            <label className="upload-btn">
              Change Photo
              <input
                type="file"
                onChange={handlePhotoUpload}
                hidden
              />
            </label>
          </div>

          <div className="floating-field">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <label>Username</label>
          </div>

          <div className="floating-field">
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
            />
            <label>Bio</label>
          </div>

          <div className="role-selector">
            <button
              className={editRole === "reader" ? "active" : ""}
              onClick={() => setEditRole("reader")}
            >
              Reader
            </button>

            <button
              className={editRole === "writer" ? "active" : ""}
              onClick={() => setEditRole("writer")}
            >
              Writer
            </button>
          </div>

          <div className="floating-field">
            <input
              type="date"
              value={editDob}
              onChange={(e) => setEditDob(e.target.value)}
            />
            <label>Date of Birth</label>
          </div>

          <div className="modal-actions">
            <button onClick={() => setShowEdit(false)}>
              Cancel
            </button>

            <button
              className="save-btn"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
);




}
