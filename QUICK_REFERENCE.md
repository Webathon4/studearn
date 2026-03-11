# 🚀 Quick Reference: Coin System Implementation

## 📂 Files Added

### Backend
```
backend/models/
  ├── Wallet.js                    ✨ NEW - User coin wallet
  └── CoinTransaction.js           ✨ NEW - Transaction records

backend/controllers/
  └── walletController.js          ✨ NEW - Wallet operations

backend/routes/
  └── walletRoutes.js              ✨ NEW - Wallet API routes
```

### Frontend
```
frontend/src/hooks/
  └── useWallet.js                 ✨ NEW - Wallet data hook

frontend/src/components/
  ├── WalletBalance.jsx            ✨ NEW - Balance display
  └── BuyCoinsModal.jsx            ✨ NEW - Coin purchase modal
```

---

## 📝 Files Modified

### Backend
```
✏️ backend/server.js
   - Added walletRoutes import
   - Registered /api/wallet routes

✏️ backend/models/Task.js
   - Added rewardCoins field (default: 0)
   - Added isCampusTask field (default: false)

✏️ backend/controllers/taskController.js
   - Updated createTask() with coin locking
   - Updated completeTask() with coin transfer
   - Updated cancelTask() with transactions
   - Updated updateTask() with coin fields
   - Added MongoDB transaction support
```

### Frontend
```
✏️ frontend/src/components/NavBar.jsx
   - Added WalletBalance import
   - Display wallet balance for all users

✏️ frontend/src/pages/Dashboard.jsx (Student)
   - Added useWallet hook
   - Added coin balance stat card

✏️ frontend/src/pages/ClientDashboard.jsx (Provider)
   - Added "Buy Coins" button
   - Added coin balance display
   - Integrated BuyCoinsModal

✏️ frontend/src/pages/PostTask.jsx
   - Added isCampusTask checkbox
   - Added rewardCoins input
   - Added balance validation
   - Updated form submission

✏️ frontend/src/pages/TaskFeed.jsx
   - Display coin reward badge

✏️ frontend/src/pages/JobDetails.jsx
   - Show coin reward in details

✏️ frontend/src/index.css
   - Added .wallet-balance styles
   - Added modal styles
```

---

## 🔑 Key API Endpoints

### Wallet Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/wallet/purchase-coins` | Buy coins |
| GET | `/api/wallet/balance` | Get coin balance |
| GET | `/api/wallet/transactions` | Get transaction history |

### Extended Task Endpoints
| Existing Endpoint | New Fields |
|-------------------|------------|
| `POST /api/tasks` | `isCampusTask`, `rewardCoins` |
| `PUT /api/tasks/:id` | `isCampusTask`, `rewardCoins` |

---

## 🎯 Core Business Logic

### Task Creation Flow
```
1. Provider posts task with rewardCoins
2. System checks if balance >= rewardCoins
3. If yes:
   - Create task
   - Lock coins (deduct from balance)
   - Record lock transaction
4. If no:
   - Return error: "Insufficient coins"
```

### Task Completion Flow
```
1. Provider marks task as "completed"
2. System:
   - Awards student: task.pay (cash)
   - Awards student: task.rewardCoins (coins)
   - Updates student trust score
   - Records coin transfer transactions
3. Locked coins → Student wallet
```

### Task Skip Flow
```
1. Provider marks task as "skipped"
2. System:
   - Decreases student trust score
   - Releases locked coins back to provider
   - Records release transaction
```

---

## 💡 Design Decisions

### Why Lock Coins on Task Post?
- Ensures provider commitment
- Prevents overselling (posting tasks without funds)
- Guarantees student payment on completion

### Why Not Release Coins on Student Cancel?
- Coins stay locked for the task
- Encourages provider to reassign or delete task
- Can be modified if different behavior is needed

### Why Separate Cash + Coins?
- Maintains backward compatibility
- Allows gradual migration to coins
- Provides dual incentives for students

---

## 🔧 Configuration Tips

### Adjust Coin Prices (Future)
Currently coins are 1:1 simulated. To add pricing:

```javascript
// walletController.js
export const purchaseCoins = async (req, res) => {
  const { amount } = req.body;
  const COIN_PRICE = 0.10; // ₹0.10 per coin
  const totalCost = amount * COIN_PRICE;
  
  // Integrate payment gateway here
  // ...
}
```

### Customize Transaction Types
Add new transaction types in `CoinTransaction.js`:

```javascript
type: {
  type: String,
  enum: ["credit", "debit", "lock", "release", "refund", "bonus"], // Add more
  required: true,
}
```

---

## 🎨 UI Customization

### Change Coin Display Color
In `index.css`:
```css
.wallet-balance {
  color: var(--accent); /* Change to any color */
}
```

### Modify Quick Buy Amounts
In `BuyCoinsModal.jsx`:
```javascript
const predefinedAmounts = [100, 500, 1000, 2000, 5000];
// Change to: [50, 200, 1000, 5000, 10000]
```

---

## 🐛 Common Errors & Fixes

### Error: "Insufficient coin balance"
**Cause**: Trying to post task without enough coins  
**Fix**: Buy coins via "Buy Coins" button

### Error: "Wallet not found"
**Cause**: Wallet wasn't created automatically  
**Fix**: System creates wallets on first access. Refresh page.

### Error: "Task creation failed"
**Cause**: Coin locking failed mid-transaction  
**Fix**: MongoDB transaction aborted. Check balance and retry.

---

## 📊 Database Schema Quick Reference

### Wallet
```javascript
{
  _id: ObjectId,
  userId: ObjectId (User),
  coinBalance: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### CoinTransaction
```javascript
{
  _id: ObjectId,
  userId: ObjectId (User),
  type: "credit" | "debit" | "lock" | "release",
  amount: Number,
  referenceTaskId: ObjectId (Task) | null,
  status: "pending" | "completed" | "cancelled",
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Task (Extended)
```javascript
{
  // ... existing fields ...
  rewardCoins: Number (default: 0),
  isCampusTask: Boolean (default: false),
}
```

---

## ✅ Testing Checklist

- [ ] Provider can buy coins
- [ ] Balance updates in real-time
- [ ] Campus task can be posted
- [ ] Coins are locked on task creation
- [ ] Student receives coins on completion
- [ ] Coins are released on task skip
- [ ] Regular tasks still work (backward compatible)
- [ ] Validation prevents negative balance
- [ ] Transaction history is accurate
- [ ] UI displays coin rewards properly

---

## 🚀 Deployment Steps

1. **Pull Latest Code**
   ```bash
   git pull origin main
   ```

2. **Backend**
   ```bash
   cd backend
   npm install    # No new dependencies
   npm start
   ```

3. **Frontend**
   ```bash
   cd frontend
   npm install    # No new dependencies
   npm run dev
   ```

4. **Test**
   - Login as provider
   - Buy coins
   - Post campus task
   - Complete as student
   - Verify coin transfer

---

## 🎓 Learning Resources

### MongoDB Transactions
- [Mongoose Transactions Guide](https://mongoosejs.com/docs/transactions.html)

### React Custom Hooks
- [React Hooks Documentation](https://react.dev/reference/react)

### Atomic Operations
- Why we use transactions: Ensures data consistency
- Prevents race conditions in concurrent coin operations

---

## 📞 Quick Support

**Issue**: Something not working?
1. Check browser console (F12)
2. Check server terminal logs
3. Verify MongoDB is running
4. Check API responses in Network tab
5. Review `COIN_SYSTEM_IMPLEMENTATION.md` for details

---

**Version**: 1.0.0  
**Last Updated**: February 2026
