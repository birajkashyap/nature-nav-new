console.log("Current ADMIN_PASSWORD_HASH from env:");
console.log(process.env.ADMIN_PASSWORD_HASH);
console.log("\nLength:", process.env.ADMIN_PASSWORD_HASH?.length);
console.log("First 10 chars:", process.env.ADMIN_PASSWORD_HASH?.substring(0, 10));
console.log("\n✅ CORRECT format for .env:");
console.log('ADMIN_PASSWORD_HASH="$2b$10$A9tNhIsAv1AuZobcAVYli./EdR61cJFoC1OnNfoBRIWqMWEyoD6Xa"');
console.log("\n⚠️ The quotes are REQUIRED to prevent $ from being interpreted as variables!");
