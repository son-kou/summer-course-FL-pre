// Optional real-time backend configuration.
//
// This file is safe to commit: a Firebase web config identifies a project,
// it is not a secret credential. Access control comes from Realtime
// Database security rules (see LIVE_INTERACTION_ARCHITECTURE.md), not from
// hiding this object.
//
// Leave the placeholder values below untouched to run entirely without a
// backend: the live activity falls back to same-machine rehearsal mode
// (LocalProvider) automatically, and the instructor can always force a full
// synthetic classroom with "?demo=1" regardless of this file.
//
// To enable a real ~60-phone classroom session over Wi-Fi, follow the setup
// steps in LIVE_INTERACTION_ARCHITECTURE.md and replace every value below
// with the config object shown in the Firebase console
// (Project settings -> General -> Your apps -> SDK setup and configuration).
export const firebaseConfig = {
  apiKey: "AIzaSyDwVH-5FtALDpfh57xGOiyQPB2G7U_RkGQ",
  authDomain: "fl-summer-course.firebaseapp.com",
  databaseURL: "https://fl-summer-course-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fl-summer-course",
  storageBucket: "fl-summer-course.firebasestorage.app",
  messagingSenderId: "1059592963311",
  appId: "1:1059592963311:web:6c9a06b1baaabb39a0471a",
};
