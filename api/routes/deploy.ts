import { Router } from "express";

const router = Router();

// Mock data for deploy logs
// In a real application, this would fetch from Vercel/Netlify API
const logs = [
  {
    id: "1",
    status: "error",
    message: "[error]  ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with \"frozen-lockfile\" because pnpm-lock.yaml is not up to date with <ROOT>/package.json",
    timestamp: new Date().toISOString(),
    commit_hash: "a1b2c3d",
    branch: "main"
  },
  {
    id: "2",
    status: "success",
    message: "Build completed successfully\nOutput: .next/\nDuration: 45s",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    commit_hash: "e5f6g7h",
    branch: "main"
  },
  {
    id: "3",
    status: "success",
    message: "Database migration applied: 20260301_dashboard_features.sql",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    commit_hash: "9i8j7k6",
    branch: "feat/dashboard"
  }
];

router.get("/logs", (req, res) => {
  // Simulate delay
  setTimeout(() => {
    res.json(logs);
  }, 500);
});

export default router;
