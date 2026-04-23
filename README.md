# SafePrint 🛡️📑🚀

**"Your Data. Your Print. Gone Forever."**

SafePrint is a privacy-first, ephemeral file-transfer protocol designed to eliminate the digital footprint left behind by traditional printing workflows. It enables users to securely transfer sensitive documents to local print shops without ever logging into public PCs (WhatsApp Web, Email) or leaving files on shop disks.

---

## 🧐 The "Society Question"

When you print an Aadhaar card or a Bank Statement at a local shop, where does that data go after you leave? Most often, it's sitting in the shopkeeper's `Downloads` folder, exposed to anyone who sits at that public PC next. 

**SafePrint solves this by making physical documents as ephemeral as a snap.**

---

## ✨ Core Features

- **"Burn-After-Reading" Protocol**: Files are streamed through memory and permanently purged (`fs.unlink`) immediately after a single successful print. 
- **End-to-End Security**: Documents are encrypted using **AES-256-CBC** at rest on the server.
- **Zero-Account Trust**: No registration required. Transfers are initiated via one-time alphanumeric codes and QR codes.
- **PDF Password Protection**: Seamlessly preview and print password-protected PDFs (like Aadhaar cards) without exposing the password to the shop owner.
- **Anti-Screenshot Defense**: Web-app includes aggressive blur-on-focus-loss and print-screen detection during the "Hold to Reveal" preview.
- **Business Dashboard**: A professional interface for shop owners with AI-driven traffic forecasting and dynamic pricing logic.

---

## 🛠️ The Ephemeral Workflow

1.  **Secure Upload**: User uploads a document; the server encrypts it using `AES-256-CBC` and stores it as a buffer in memory.
2.  **Code Generation**: A one-time 6-digit alphanumeric code or QR is generated.
3.  **Physical Print**: The shopkeeper inputs the code. The server decrypts the file *directly to the printer stream*.
4.  **Auto-Purge**: The backend triggers a physical deletion (`fs.unlink`) the millisecond the print job completes or expires.

---

## 🏗️ Tech Stack

| Component | Responsibility | Tech Used |
| :--- | :--- | :--- |
| **Frontend** | Secure UI & Interaction | React.js, Tailwind CSS, Framer Motion |
| **Backend** | Ephemeral Streaming | Node.js, Express |
| **Security** | Encryption & PDF decryption | `crypto`, `muhammara` |
| **Hardware** | Direct Printer Handoff | `pdf-to-printer` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- A printer configured on your host machine (for backend printing)



## 🛡️ Security Highlights

1. **Memory Buffering**: We minimize disk-resident time by processing files as buffers.
2. **Entropy Codes**: Randomly generated high-entropy codes that expire after a single use.
3. **Physical Shielding**: The "Hold to Reveal" feature ensures zero visibility until the user is physically present at the shop.

---
 
