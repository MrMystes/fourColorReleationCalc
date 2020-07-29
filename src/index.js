import { buildGraphMatrix } from './buildGraphMatrix';
import { calcFourColorReleation } from './fourColorCaclculate';

const calcReleations = async function(coordinates) {
	const matrix = await buildGraphMatrix(coordinates);
	return calcFourColorReleation(matrix);
};

export {
	buildGraphMatrix,
	calcFourColorReleation,
	calcReleations
};


