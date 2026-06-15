type NpmPackageMeta = {
	dependencies?: Record<string, string>;
	dist: {
		integrity: string;
		tarball: string;
	};
	license?: string;
};

type PackageLockEntry = Record<string, unknown>;

type PackageLockPackages = Record<string, PackageLockEntry>;
