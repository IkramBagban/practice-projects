export const data: any = [];

interface ISubmission {
  id: number;
  problemId: number;
  userId: number;
  code: string;
  language: string;
}

class StoreManager {
  private submissions: Set<ISubmission> | null = null;
  private static instance: StoreManager | null = null;
  private totalRequestProcessByThisServer;

  private constructor() {
    this.submissions = new Set();
    this.totalRequestProcessByThisServer = 0;
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    return (this.instance = new StoreManager());
  }

  addSubmission(submission: ISubmission) {
    console.log("storing submission...");
    const payload = { ...submission, id: Math.random() };
    this.submissions?.add(payload);
  }

  increaseProcessReq() {
    this.totalRequestProcessByThisServer++;
  }

  startLogger() {
    setInterval(
      () =>
        console.log(
          `total request processed by this worker is ${this.totalRequestProcessByThisServer}`
        ),
      2000
    );
  }
}

export const storeManager = StoreManager.getInstance();
