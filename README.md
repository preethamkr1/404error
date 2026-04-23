# SafePrint 🛡️📑🚀

**"Privacy-first printing system enabling secure real-time document transfer with automatic deletion and zero data persistence."**

---

## 🏗️ System Architecture

<p align="center">
  <img src="assets/architecture.png" alt="SafePrint System Architecture" width="900"/>
</p>

---

SafePrint is a privacy-first, ephemeral file-transfer protocol designed to eliminate the digital footprint left behind by traditional printing workflows. It enables users to securely transfer sensitive documents to local print shops without ever logging into public PCs (WhatsApp Web, Email) or leaving files on shop disks.

---

## 🧐 The "Society Question"

When you print an Aadhaar card or a Bank Statement at a local shop, where does that data go after you leave? Most often, it's sitting in the shopkeeper's `Downloads` folder, exposed to anyone who sits at that public PC next.

> **SafePrint solves this by making physical documents as ephemeral as a snap.**

---

## ✨ Core Features

- 🔥 **Burn-After-Reading Protocol**  
  Files are streamed through memory and permanently purged (`fs.unlink`) after a single successful print.

- 🔐 **End-to-End Security**  
  Documents are encrypted using **AES-256-CBC**.

- 🚫 **Zero-Account Trust**  
  No login required. Uses one-time codes / QR.

- 📄 **PDF Password Support**  
  Securely print protected PDFs without exposing passwords.

- 👁️ **Anti-Screenshot Protection**  
  Blur + detection for secure preview.

- 📊 **Business Dashboard**  
  AI-driven analytics + dynamic pricing.

---

## 🛠️ Ephemeral Workflow

1. **Secure Upload** → File encrypted (`AES-256-CBC`)
2. **Code Generation** → OTP / QR created  
3. **Print Execution** → Decrypt → stream to printer  
4. **Auto Delete** → File permanently removed  

---

## 🏗️ Tech Stack

| Layer | Tech |
|------|------|
| Frontend | React.js, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Security | crypto, muhammara |
| Printing | pdf-to-printer |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm / yarn
- Printer configured

---

## 🛡️ Security Highlights

- 🧠 **Memory Buffering** → No long-term storage  
- 🔢 **One-Time Codes** → High entropy + expiry  
- 👀 **Hold-to-Reveal** → Prevents shoulder surfing  

---

## 🌟 Vision

> Secure printing should be as temporary as a message — not a permanent data leak.

---