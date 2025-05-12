// Add near the bottom, before program.parse(...)
program
  .command('set-threshold <amt>')
  .description('Update the anomaly threshold for mint events')
  .action(async (amt) => {
    try {
      const res = await fetch(`${API_BASE}/api/threshold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: Number(amt) }),
      });
      if (!res.ok) throw new Error(await res.text());
      console.log(chalk.green(`Threshold updated to ${amt}`));
    } catch (e) {
      console.error(chalk.red('Failed to set threshold:'), e.message);
    }
  });
