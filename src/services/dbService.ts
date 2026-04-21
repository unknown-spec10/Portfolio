import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  limit,
  orderBy
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserProfile, Project } from "../types";

export const dbService = {
  // Profile
  async getProfileByUid(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  },

  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    const q = query(collection(db, "users"), where("username", "==", username), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as UserProfile;
    }
    return null;
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    const docRef = doc(db, "users", profile.uid);
    await setDoc(docRef, {
      ...profile,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  // Projects
  async saveProject(project: Partial<Project>): Promise<string> {
    const id = project.id || doc(collection(db, "projects")).id;
    const docRef = doc(db, "projects", id);
    await setDoc(docRef, {
      ...project,
      id,
      updatedAt: serverTimestamp(),
      createdAt: project.createdAt || serverTimestamp()
    }, { merge: true });
    return id;
  },

  async deleteProject(projectId: string): Promise<void> {
    await deleteDoc(doc(db, "projects", projectId));
  },

  async getUserProjects(userId: string): Promise<Project[]> {
    const q = query(
      collection(db, "projects"), 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Project);
  },

  async getPublicProjects(username?: string): Promise<Project[]> {
    let q;
    if (username) {
      q = query(
        collection(db, "projects"), 
        where("username", "==", username),
        where("status", "==", "public"),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, "projects"), 
        where("status", "==", "public"),
        orderBy("createdAt", "desc")
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Project);
  }
};
