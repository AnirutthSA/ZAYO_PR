import { useState, useEffect, useRef } from "react";

// ─── TYPES ────────────────────────────────────────────────────
type Screen = "home" | "chat" | "my-prs" | "approvals";
type PRType = "inventory" | "expense" | null;
type MessageType = "bot" | "user" | "card" | "options" | "input" | "review" | "success";

interface Message {
  id: string;
  type: MessageType;
  content?: string;
  options?: { label: string; value: string; icon?: string }[];
  field?: string;
  inputType?: string;
  placeholder?: string;
  cardData?: any;
  searchable?: boolean;
}

// ─── SAMPLE DATA ──────────────────────────────────────────────
const itemMasterData = [
  { id: "ITM-001", name: "Laptop Dell XPS 15", unitPrice: "1200", warehouse: "WH-EAST-01" },
  { id: "ITM-002", name: "Network Switch 24-Port", unitPrice: "800", warehouse: "WH-WEST-02" },
  { id: "ITM-003", name: "UPS Battery 1500VA", unitPrice: "350", warehouse: "WH-EAST-01" },
  { id: "ITM-004", name: "Server RAM 32GB", unitPrice: "280", warehouse: "WH-CENTRAL-03" },
  { id: "ITM-005", name: "Fiber Optic Cable 100m", unitPrice: "150", warehouse: "WH-WEST-02" },
];

const samplePRs = [
  { id: "PR-2024-001", type: "Inventory", item: "Laptop Dell XPS", status: "Approved", date: "2024-06-01", amount: "$1,200" },
  { id: "PR-2024-002", type: "Expense", item: "Office Supplies", status: "Pending", date: "2024-06-10", amount: "$450" },
  { id: "PR-2024-003", type: "Inventory", item: "Network Switch", status: "Rejected", date: "2024-06-15", amount: "$800" },
];

const pendingApprovals = [
  { id: "PR-2024-004", requestedBy: "John Smith", type: "Inventory", item: "Server Rack", amount: "$3,500", date: "2024-06-20" },
  { id: "PR-2024-005", requestedBy: "Sarah Lee", type: "Expense", item: "Training Materials", amount: "$250", date: "2024-06-22" },
];

// ─── COLORS ───────────────────────────────────────────────────
const C = {
  orange: "#e87722",
  navy: "#0f2d48",
  dark: "#0a1520",
  mid: "#0f2236",
  card: "#132030",
  border: "#1a3040",
  text: "#ccd6e0",
  subtle: "#88aabb",
  good: "#2ecc71",
  warn: "#f39c12",
  danger: "#e74c3c",
  white: "#ffffff",
};

// ─── INVENTORY STEPS ──────────────────────────────────────────
const inventorySteps = [
  { field: "item_search", type: "search", message: "🔍 Let's find the item you need. Search by item name or ID:", placeholder: "Type to search items..." },
  { field: "purchasingCompany", type: "text", message: "🏢 What is the purchasing company?", placeholder: "e.g. ZAYO USA LLC" },
  { field: "quantity", type: "number", message: "🔢 How many units do you need?", placeholder: "e.g. 5" },
  { field: "deliveryDate", type: "date", message: "📅 When do you need it delivered?", placeholder: "" },
  { field: "subInventory", type: "text", message: "📦 Sub-inventory location? (optional)", placeholder: "e.g. SUB-EAST-01" },
  { field: "projectNumber", type: "text", message: "📁 Project number? (optional)", placeholder: "e.g. PRJ-2024-001" },
  { field: "taskNumber", type: "text", message: "✅ Task number? (optional)", placeholder: "e.g. TASK-001" },
  { field: "acknowledged", type: "acknowledge", message: "📋 Please acknowledge before submitting:" },
];

// ─── EXPENSE STEPS ────────────────────────────────────────────
const expenseSteps = [
  { field: "description", type: "text", message: "📝 Describe what you want to purchase:", placeholder: "e.g. 10 office chairs for new hires" },
  { field: "goodsOrServices", type: "options", message: "🛒 Is this for goods or services?", options: [{ label: "Goods", value: "goods", icon: "📦" }, { label: "Services", value: "services", icon: "🛠️" }] },
  { field: "category", type: "options", message: "🏷️ Select a category:", options: [{ label: "IT & Technology", value: "it", icon: "💻" }, { label: "Office Supplies", value: "office", icon: "🖊️" }, { label: "Maintenance", value: "maintenance", icon: "🔧" }, { label: "Consulting", value: "consulting", icon: "👔" }, { label: "Travel", value: "travel", icon: "✈️" }, { label: "Other", value: "other", icon: "📌" }] },
  { field: "deliveryDate", type: "date", message: "📅 When do you need it?", placeholder: "" },
  { field: "approvedSupplier", type: "text", message: "🏪 Who is the approved supplier?", placeholder: "e.g. TechCorp Inc." },
  { field: "quantity", type: "number", message: "🔢 Quantity needed?", placeholder: "e.g. 10" },
  { field: "price", type: "number", message: "💵 Unit price ($)?", placeholder: "e.g. 50.00" },
  { field: "projectNumber", type: "text", message: "📁 Project number? (optional)", placeholder: "e.g. PRJ-2024-001" },
  { field: "taskNumber", type: "text", message: "✅ Task number? (optional)", placeholder: "e.g. TASK-001" },
  { field: "emergencyRestoration", type: "options", message: "⚡ Emergency restoration request?", options: [{ label: "Yes - Emergency", value: "yes", icon: "⚡" }, { label: "No - Standard", value: "no", icon: "📋" }] },
  { field: "acknowledged", type: "acknowledge", message: "📋 Almost done! Please acknowledge:" },
];

const Badge = ({ status }: { status: string }) => {
  const color = status === "Approved" ? C.good : status === "Pending" ? C.warn : C.danger;
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{status}</span>;
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [messages, setMessages] = useState<Message[]>([]);
  const [prType, setPRType] = useState<PRType>(null);
  const [prData, setPRData] = useState<any>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const addMessage = (msg: Omit<Message, "id">) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString() + Math.random() }]);
  };

  const startChat = (type: PRType) => {
    setPRType(type);
    setPRData({});
    setCurrentStep(0);
    setMessages([]);
    setInputValue("");
    setSearchResults([]);
    setScreen("chat");

    setTimeout(() => {
      addMessage({ type: "bot", content: `👋 Let's create your ${type === "inventory" ? "📦 Inventory" : "💳 Expense"} Purchase Request!\n\nI'll guide you step by step.` });
    }, 300);

    setTimeout(() => {
      const steps = type === "inventory" ? inventorySteps : expenseSteps;
      const step = steps[0];
      addMessage({ type: step.type === "options" ? "options" : "input", content: step.message, field: step.field, options: step.options, inputType: step.type, placeholder: step.placeholder, searchable: step.type === "search" });
    }, 1200);
  };

  const handleUserInput = (value: string, field: string, displayValue?: string) => {
    addMessage({ type: "user", content: displayValue || value });
    const newData = { ...prData, [field]: value };
    setPRData(newData);

    const steps = prType === "inventory" ? inventorySteps : expenseSteps;
    const nextStep = currentStep + 1;

    if (field === "item_search") {
      const item = itemMasterData.find(i => i.id === value);
      if (item) {
        const autoFilled = { ...newData, itemMaster: item.id, itemName: item.name, unitPrice: item.unitPrice, warehouse: item.warehouse };
        setPRData(autoFilled);
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addMessage({ type: "card", cardData: { title: "✅ Item Found & Auto-Filled!", facts: [{ label: "Item #", value: item.id }, { label: "Name", value: item.name }, { label: "Price", value: `$${item.unitPrice}` }, { label: "Warehouse", value: item.warehouse }] } });
          setTimeout(() => showNextStep(nextStep, steps, autoFilled), 800);
        }, 600);
        setCurrentStep(nextStep);
        setInputValue("");
        setSearchResults([]);
        return;
      }
    }

    setCurrentStep(nextStep);
    setInputValue("");
    setSearchResults([]);

    if (nextStep >= steps.length) { showReview(newData); return; }
    showNextStep(nextStep, steps, newData);
  };

  const showNextStep = (stepIndex: number, steps: any[], data: any) => {
    const step = steps[stepIndex];
    if (!step) { showReview(data); return; }
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      if (step.type === "options" || step.type === "acknowledge") {
        const opts = step.type === "acknowledge" ? [{ label: "✅ I Acknowledge & Confirm", value: "yes", icon: "✅" }] : step.options;
        addMessage({ type: "options", content: step.message, field: step.field, options: opts });
      } else {
        addMessage({ type: "input", content: step.message, field: step.field, inputType: step.type, placeholder: step.placeholder, searchable: step.type === "search" });
      }
    }, 600);
  };

  const showReview = (data: any) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ type: "bot", content: "🎉 All done! Here's your PR summary. Review and submit!" });
      setTimeout(() => addMessage({ type: "review", cardData: data }), 800);
    }, 600);
  };

  const handleSearch = (query: string) => {
    setInputValue(query);
    setSearchResults(query.length > 0 ? itemMasterData.filter(i => i.name.toLowerCase().includes(query.toLowerCase()) || i.id.toLowerCase().includes(query.toLowerCase())) : []);
  };

  const submitPR = () => {
    addMessage({ type: "user", content: "✅ Submit PR" });
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ type: "success", cardData: { prId: `PR-${Date.now().toString().slice(-6)}`, prType } });
    }, 1000);
  };

  const Sidebar = () => (
    <div style={{ width: 190, background: "#060e18", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, background: C.orange, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: C.white, fontStyle: "italic" }}>Z</div>
          <div>
            <div style={{ color: C.white, fontWeight: 700, fontSize: 12 }}>ZAYO PR</div>
            <div style={{ color: C.subtle, fontSize: 9 }}>Purchase Assistant</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "8px 0" }}>
        {[{ id: "home", icon: "🏠", label: "Home" }, { id: "my-prs", icon: "📋", label: "My PRs" }, { id: "approvals", icon: "⏳", label: "Approvals" }].map(item => (
          <div key={item.id} onClick={() => setScreen(item.id as Screen)} style={{ padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: screen === item.id ? C.white : C.subtle, background: screen === item.id ? C.mid : "transparent", borderLeft: screen === item.id ? `3px solid ${C.orange}` : "3px solid transparent", transition: "all 0.2s", fontWeight: screen === item.id ? 600 : 400 }}>
            <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
          </div>
        ))}
        <div style={{ padding: "16px 14px 8px" }}>
          <div style={{ fontSize: 9, color: C.subtle, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>Create PR</div>
          {[{ type: "inventory" as PRType, icon: "📦", label: "Inventory PR" }, { type: "expense" as PRType, icon: "💳", label: "Expense PR" }].map(item => (
            <div key={item.type} onClick={() => startChat(item.type)} style={{ padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.subtle, borderRadius: 6, marginBottom: 4 }}>
              <span>{item.icon}</span>{item.label}
            </div>
          ))}
        </div>
      </nav>
      <div style={{ padding: 10, borderTop: `1px solid ${C.border}` }}>
        <div style={{ background: C.mid, border: `1px dashed ${C.border}`, borderRadius: 8, padding: "8px 10px", cursor: "pointer" }}>
          <div style={{ fontSize: 10, color: C.orange, fontWeight: 700, marginBottom: 2 }}>📎 Attach Docs</div>
          <div style={{ fontSize: 8, color: C.subtle }}>Quotes, invoices, specs</div>
        </div>
      </div>
    </div>
  );

  const HomeScreen = () => (
    <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: C.orange, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>Welcome</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 4 }}>ZAYO PR Assistant</div>
        <div style={{ fontSize: 13, color: C.subtle }}>Create and track purchase requests through a guided conversation</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24, maxWidth: 500 }}>
        {[{ type: "inventory" as PRType, icon: "📦", title: "Inventory PR", desc: "Request items from item master with auto-fill", color: C.orange }, { type: "expense" as PRType, icon: "💳", title: "Expense PR", desc: "Request goods or services with custom details", color: "#6264a7" }].map(card => (
          <div key={card.type} onClick={() => startChat(card.type)} style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, cursor: "pointer", borderTop: `3px solid ${card.color}` }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 4 }}>{card.title}</div>
            <div style={{ fontSize: 11, color: C.subtle }}>{card.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", maxWidth: 600 }}>
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.white }}>Recent Requests</div>
        </div>
        {samplePRs.map(pr => (
          <div key={pr.id} style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.white }}>{pr.item}</div>
              <div style={{ fontSize: 10, color: C.subtle }}>{pr.id} · {pr.type} · {pr.date}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: C.white, fontWeight: 600 }}>{pr.amount}</span>
              <Badge status={pr.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ChatScreen = () => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ background: C.navy, borderBottom: `2px solid ${C.orange}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={() => setScreen("home")} style={{ background: "transparent", border: "none", color: C.subtle, cursor: "pointer", fontSize: 16 }}>←</button>
        <div style={{ width: 28, height: 28, background: C.orange, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤖</div>
        <div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 13 }}>PR Assistant</div>
          <div style={{ color: C.good, fontSize: 9, display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: C.good }} />Active</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 10, color: C.subtle }}>{prType === "inventory" ? "📦 Inventory PR" : "💳 Expense PR"}</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map(msg => (
          <div key={msg.id}>
            {msg.type === "bot" && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", maxWidth: "80%" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🤖</div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "4px 12px 12px 12px", padding: "10px 14px", fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg.content}</div>
              </div>
            )}

            {msg.type === "user" && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: C.orange, borderRadius: "12px 4px 12px 12px", padding: "10px 14px", fontSize: 13, color: C.white, maxWidth: "70%", lineHeight: 1.6 }}>{msg.content}</div>
              </div>
            )}

            {msg.type === "card" && msg.cardData && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", maxWidth: "85%" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🤖</div>
                <div style={{ background: C.card, border: `1px solid ${C.good}44`, borderRadius: "4px 12px 12px 12px", overflow: "hidden", flex: 1 }}>
                  <div style={{ background: C.good + "22", padding: "8px 12px", fontSize: 11, fontWeight: 700, color: C.good }}>{msg.cardData.title}</div>
                  <div style={{ padding: "10px 12px" }}>
                    {msg.cardData.facts.map((f: any) => (
                      <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        <span style={{ color: C.subtle }}>{f.label}</span>
                        <span style={{ color: C.white, fontWeight: 600 }}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {msg.type === "options" && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🤖</div>
                <div style={{ flex: 1 }}>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "4px 12px 12px 12px", padding: "10px 14px", fontSize: 13, color: C.text, marginBottom: 8, lineHeight: 1.6 }}>{msg.content}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {msg.options?.map(opt => (
                      <button key={opt.value} onClick={() => msg.field && handleUserInput(opt.value, msg.field, `${opt.icon || ""} ${opt.label}`)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "7px 14px", fontSize: 12, color: C.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                        {opt.icon && <span>{opt.icon}</span>}{opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {msg.type === "input" && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🤖</div>
                <div style={{ flex: 1 }}>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "4px 12px 12px 12px", padding: "10px 14px", fontSize: 13, color: C.text, marginBottom: 8, lineHeight: 1.6 }}>{msg.content}</div>
                  {msg.searchable ? (
                    <div style={{ position: "relative" }}>
                      <input value={inputValue} onChange={e => handleSearch(e.target.value)} placeholder={msg.placeholder} style={{ width: "100%", background: C.card, border: `1px solid ${C.orange}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.white, outline: "none", boxSizing: "border-box" }} />
                      {searchResults.length > 0 && (
                        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.mid, border: `1px solid ${C.border}`, borderRadius: 8, zIndex: 10, marginTop: 4 }}>
                          {searchResults.map(item => (
                            <div key={item.id} onClick={() => handleUserInput(item.id, msg.field!, item.name)} style={{ padding: "10px 12px", cursor: "pointer", borderBottom: `1px solid ${C.border}` }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: C.white }}>{item.name}</div>
                              <div style={{ fontSize: 10, color: C.subtle }}>{item.id} · ${item.unitPrice} · {item.warehouse}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : msg.inputType === "date" ? (
                    <input type="date" onChange={e => msg.field && handleUserInput(e.target.value, msg.field)} style={{ background: C.card, border: `1px solid ${C.orange}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.white, outline: "none" }} />
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type={msg.inputType || "text"}
                        placeholder={msg.placeholder}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value;
                            if (val && msg.field) { handleUserInput(val, msg.field); (e.target as HTMLInputElement).value = ""; }
                          }
                        }}
                        style={{ flex: 1, background: C.card, border: `1px solid ${C.orange}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.white, outline: "none" }}
                      />
                      {msg.content?.includes("optional") && (
                        <button onClick={() => msg.field && handleUserInput("—", msg.field, "Skip")} style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 14px", fontSize: 12, color: C.subtle, cursor: "pointer" }}>Skip</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {msg.type === "review" && msg.cardData && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🤖</div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "4px 12px 12px 12px", overflow: "hidden", flex: 1, maxWidth: "85%" }}>
                  <div style={{ background: C.navy, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>📋 PR Summary</div>
                    <span style={{ background: C.warn + "22", color: C.warn, fontSize: 10, padding: "2px 8px", borderRadius: 10 }}>Draft</span>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    {Object.entries(msg.cardData).filter(([k, v]) => v && v !== "—").map(([key, val]) => (
                      <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        <span style={{ color: C.subtle, textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <span style={{ color: C.white, fontWeight: 500 }}>{String(val)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "10px 14px", display: "flex", gap: 8, borderTop: `1px solid ${C.border}` }}>
                    <button onClick={submitPR} style={{ flex: 1, background: C.good, border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, color: C.white, cursor: "pointer" }}>✅ Submit PR</button>
                    <button onClick={() => startChat(prType)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.subtle, cursor: "pointer" }}>✏️ Start Over</button>
                  </div>
                </div>
              </div>
            )}

            {msg.type === "success" && msg.cardData && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🤖</div>
                <div style={{ background: C.card, border: `1px solid ${C.good}44`, borderRadius: "4px 12px 12px 12px", overflow: "hidden", maxWidth: "85%" }}>
                  <div style={{ background: C.good + "22", padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 4 }}>🎉</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.good }}>PR Submitted Successfully!</div>
                  </div>
                  <div style={{ padding: 14 }}>
                    {[{ label: "PR ID", value: msg.cardData.prId }, { label: "Status", value: "🟡 Pending Approval" }, { label: "Submitted", value: new Date().toLocaleDateString() }].map(f => (
                      <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        <span style={{ color: C.subtle }}>{f.label}</span>
                        <span style={{ color: C.white, fontWeight: 600 }}>{f.value}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={() => setScreen("my-prs")} style={{ flex: 1, background: C.mid, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px", fontSize: 12, color: C.white, cursor: "pointer" }}>View My PRs</button>
                      <button onClick={() => setScreen("home")} style={{ flex: 1, background: C.orange, border: "none", borderRadius: 8, padding: "8px", fontSize: 12, color: C.white, cursor: "pointer", fontWeight: 600 }}>New PR</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🤖</div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "4px 12px 12px 12px", padding: "10px 14px", display: "flex", gap: 4 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.subtle, animation: `bounce 1s ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );

  const MyPRsScreen = () => (
    <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 16 }}>My Purchase Requests</div>
      <div style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
        {samplePRs.map(pr => (
          <div key={pr.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.white }}>{pr.item}</div>
              <div style={{ fontSize: 10, color: C.subtle }}>{pr.id} · {pr.type} · {pr.date}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: C.white, fontWeight: 600 }}>{pr.amount}</span>
              <Badge status={pr.status} />
              <button onClick={() => startChat(pr.type === "Inventory" ? "inventory" : "expense")} style={{ background: C.orange + "22", border: `1px solid ${C.orange}44`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: C.orange, cursor: "pointer" }}>Reuse</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ApprovalsScreen = () => (
    <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 16 }}>Pending Approvals</div>
      {pendingApprovals.map(pr => (
        <div key={pr.id} style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{pr.item}</div>
              <div style={{ fontSize: 11, color: C.subtle }}>{pr.id} · {pr.requestedBy} · {pr.date}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{pr.amount}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ background: C.good + "22", border: `1px solid ${C.good}`, borderRadius: 8, padding: "7px 14px", fontSize: 12, color: C.good, cursor: "pointer", fontWeight: 600 }}>✅ Approve</button>
            <button style={{ background: C.danger + "22", border: `1px solid ${C.danger}`, borderRadius: 8, padding: "7px 14px", fontSize: 12, color: C.danger, cursor: "pointer", fontWeight: 600 }}>❌ Reject</button>
            <button style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", fontSize: 12, color: C.subtle, cursor: "pointer" }}>View Details</button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: C.dark, height: "100vh", display: "flex", overflow: "hidden" }}>
      <style>{`
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a3040; border-radius: 2px; }
      `}</style>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {screen === "home" && <HomeScreen />}
        {screen === "chat" && <ChatScreen />}
        {screen === "my-prs" && <MyPRsScreen />}
        {screen === "approvals" && <ApprovalsScreen />}
      </div>
    </div>
  );
}
