<?php
// Recursively lint all PHP files under src and config directories

function lintDir(string $dir): int {
	$errors = 0;
	$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
	foreach ($iterator as $file) {
		if ($file->isFile() && strtolower($file->getExtension()) === 'php') {
			$path = $file->getPathname();
			$cmd = sprintf('php -l "%s"', $path);
			exec($cmd, $output, $exitCode);
			if ($exitCode !== 0) {
				$errors++;
				echo implode(PHP_EOL, $output) . PHP_EOL;
			}
			$output = [];
		}
	}
	return $errors;
}

$totalErrors = 0;
foreach ([__DIR__ . '/src', __DIR__ . '/config'] as $dir) {
	if (is_dir($dir)) {
		$totalErrors += lintDir($dir);
	}
}

if ($totalErrors > 0) {
	fwrite(STDERR, "PHP lint failed with {$totalErrors} error(s).\n");
	exit(1);
}

echo "PHP lint passed.\n";
exit(0);


