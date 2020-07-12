export const calcFourColorReleation = function (matrix) {
	const candiateColors = [1, 2, 3, 4];
	const len = matrix.length;
	// 用于存储解
	let answer = [];
	// 用于存储已解过的值的index
	let track = Array.from({ length: len }, () => 0);
	let i = 0;
	const matrixWeight = matrix.reduce((acc, cur, index) => {
		const weight = cur.reduce((sum, cur) => sum + cur, 0);
		acc.push({ weight, idx: index });
		return acc;
	}, []).sort((a, b) => b.weight - a.weight);

	const sortedMatrix = matrixWeight.map(({ idx }) => {
		return matrix[idx];
	});

	while(i >= 0 && i < len) {
		// 取出当前行进行扫描
		let curRow = sortedMatrix[i];
		curRow = matrixWeight.map(({ idx }) => {
			return curRow[idx];
		});
		
		const curCandiateColors = candiateColors.slice();
		for (let j = 0; j < len; j++) {
			if (curRow[j] === 1) {
				if (answer[j] !== 0) {
					const index = curCandiateColors.findIndex(color => color === answer[j]);
					index > -1 && curCandiateColors.splice(index, 1);
				}
			}
		}
		const curCandiateColorsIndex = track[i]++;
		if (curCandiateColors.length > 0 && curCandiateColorsIndex < curCandiateColors.length) {
			answer.push(curCandiateColors[curCandiateColorsIndex]);
			i++;
			track[i] = 0;
		} else {
			i--;
			answer.pop();
		}
	}
	return matrixWeight.reduce((acc, { idx }, index) => {
		acc[idx] = answer[index];
		return acc;
	}, []);
};