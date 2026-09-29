export type Tx = {
  id: string;
  date: string;
  category: string;
  name: string;
  amount: number;
  type: "income" | "expense";
};

export type PetData = {
  petName: string;
  equippedHead: "bow" | "cap" | "crown" | null;
  equippedNeck: "scarf" | null;
};

type BudgetData = {
  budget: number;
  junkMode: boolean;
};

const TX_KEY = "accounting-chick-transactions";
const BUDGET_KEY = "accounting-chick-budget";
const PET_KEY = "accounting-chick-pet";

const defaultBudget: BudgetData = {
  budget: 0,
  junkMode: false,
};

const defaultPet: PetData = {
  petName: "小雞",
  equippedHead: null,
  equippedNeck: null,
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  localStorage.setItem(key, JSON.stringify(value));
}

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function fetchTxs(): Promise<Tx[]> {
  return readStorage<Tx[]>(TX_KEY, []);
}

export async function createTx(tx: Omit<Tx, "id">): Promise<Tx> {
  const transactions = readStorage<Tx[]>(TX_KEY, []);

  const created: Tx = {
    ...tx,
    id: createId(),
  };

  writeStorage(TX_KEY, [...transactions, created]);

  return created;
}

export async function deleteTx(id: string): Promise<void> {
  const transactions = readStorage<Tx[]>(TX_KEY, []);

  const next = transactions.filter((tx) => tx.id !== id);

  writeStorage(TX_KEY, next);
}

export async function updateTx(
  id: string,
  tx: Omit<Tx, "id">,
): Promise<Tx> {
  const transactions = readStorage<Tx[]>(TX_KEY, []);

  const updated: Tx = {
    ...tx,
    id,
  };

  const next = transactions.map((item) =>
    item.id === id ? updated : item,
  );

  writeStorage(TX_KEY, next);

  return updated;
}

export async function fetchBudget(): Promise<BudgetData> {
  return readStorage<BudgetData>(BUDGET_KEY, defaultBudget);
}

export async function saveBudget(
  patch: Partial<BudgetData>,
): Promise<BudgetData> {
  const current = readStorage<BudgetData>(BUDGET_KEY, defaultBudget);

  const next = {
    ...current,
    ...patch,
  };

  writeStorage(BUDGET_KEY, next);

  return next;
}

export async function fetchPet(): Promise<PetData> {
  return readStorage<PetData>(PET_KEY, defaultPet);
}

export async function savePet(
  patch: Partial<PetData>,
): Promise<PetData> {
  const current = readStorage<PetData>(PET_KEY, defaultPet);

  const next = {
    ...current,
    ...patch,
  };

  writeStorage(PET_KEY, next);

  return next;
}