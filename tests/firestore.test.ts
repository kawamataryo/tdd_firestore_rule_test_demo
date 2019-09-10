import * as firebase from "@firebase/testing";
import * as fs from "fs";

const PROJECT_ID = "qiita-demo";
const RULES_PATH = "firestore.rules";

const createUnAuthDB = (): firebase.firestore.Firestore => {
  return firebase.initializeTestApp({ projectId: PROJECT_ID }).firestore();
};

const createAuthDB = (auth: object): firebase.firestore.Firestore => {
  return firebase
    .initializeTestApp({ projectId: PROJECT_ID, auth: auth })
    .firestore();
};

const usersRef = (db: firebase.firestore.Firestore) => db.collection("user");

describe("Firestoreセキュリティルール", () => {
  // ルールファイルの読み込み
  beforeAll(async () => {
    await firebase.loadFirestoreRules({
      projectId: PROJECT_ID,
      rules: fs.readFileSync(RULES_PATH, "utf8")
    });
  });

  // Firestoreデータのクリーンアップ
  afterEach(async () => {
    await firebase.clearFirestoreData({ projectId: PROJECT_ID });
  });

  // Firestoreアプリの削除
  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });

  test("認証がなくとも読み書きが可能", async () => {
    const db = createUnAuthDB();
    const user = usersRef(db).doc("test");
    await firebase.assertSucceeds(user.set({ name: "太郎" }));
    await firebase.assertSucceeds(user.get());
  });
});
