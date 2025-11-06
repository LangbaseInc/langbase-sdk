const pkg = require('../package.json');

async function main() {
	const args = process.argv.slice(2);
	
	if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
		console.log(`
Langbase CLI v${pkg.version}

Usage:
  langbase <command> [options]

Commands:
  help     Show this help message

Options:
  -h, --help     Show help
  -v, --version  Show version

Documentation:
  https://langbase.com/docs
		`);
		return;
	}

	if (args[0] === '--version' || args[0] === '-v') {
		console.log(pkg.version);
		return;
	}

	console.log('Langbase CLI - Coming soon!');
}

main().catch((error) => {
	console.error('Error:', error.message);
	process.exit(1);
});
