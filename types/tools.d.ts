type FunctionOrderViolation = {
	expected: string[];
	file: string;
	names: string[];
};

type FunctionSpacingViolation = {
	after: string;
	before: string;
	file: string;
};

type JsdocFormattingViolation = {
	file: string;
	line: number;
	message: string;
};

type TopLevelFunction = {
	blockStart: number;
	bodyEnd: number;
	name: string;
};
