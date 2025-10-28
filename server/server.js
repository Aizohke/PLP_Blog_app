# Make sure you're in the project root
cd ..

# Add changes
git add .

# Commit
git commit -m "Fix server.js for Vercel serverless deployment"

# Push to trigger Vercel deployment
git push origin main
```

### **Step 4: Wait for Deployment**

- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Click on your backend project
- Wait for deployment to complete (2-3 minutes)

### **Step 5: Test Your Backend**

Once deployed, test these URLs:

1. **Root endpoint:**
```
   https://your-backend.vercel.app/
```
   Should return API information

2. **Health check:**
```
   https://your-backend.vercel.app/api/health
