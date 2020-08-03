/**
 * DynamicWorker class
 */
function guid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
class DynamicWorker {
  constructor(worker) {
    this.uuid = guid();
    // 转换计算方法声明
    const formatFn = `const formatFn = ${worker.toString()};`;
    
    /**
     * 内部 onmessage 处理
     */
    const onMessageHandlerFn = `self.onmessage = ({ data: { data, flag, coverage } }) => {
      if (data) {
        const result = formatFn(typeof data === 'string' ? JSON.parse(data) : data)
        self.postMessage({
          data: result,
          flag
        });
      }
    }`;

    /**
     * 返回结果
     * @param {*} param0 
     */
    const handleResult = ({ data: { data, flag } }) => {
      const resolve = this.flagMapping[flag];
      
      if (resolve) {
        resolve(data);
        delete this.flagMapping[flag];
      }
    };
    
    const blob = new Blob([`(()=>{${formatFn}${onMessageHandlerFn}})()`]);
    this.worker = new Worker(URL.createObjectURL(blob));
    this.worker.addEventListener('message', handleResult);

    this.flagMapping = {};
    URL.revokeObjectURL(blob);
  }

  /**
   * 动态调用
   */
  send(data) {
    const w = this.worker;
    const flag = new Date().toString();
    w.postMessage({
      data: JSON.stringify(data),
      flag
    });

    return new Promise((res) => {
      this.flagMapping[flag] = res;
    })
  }

  close() {
    this.worker.terminate();
  }
}

function messageHandler(data) {
	function intersectsByPolygon(polygon1LinearRings, polygon2LinearRings) {
		let intersect = false;

		intersect = intersectsByLinearRings(polygon1LinearRings, polygon2LinearRings);

		if (!intersect) {
			// check if this poly contains points of the ring/linestring
			for (let i = 0, len = polygon2LinearRings.length; i < len; ++i) {
				intersect = rayCasting(polygon2LinearRings[i], polygon1LinearRings);
				if (intersect) {
					break;
				}
			}
		}

		return intersect;
	}

	function rayCasting(p, poly) {
		const px = p.x;
		const py = p.y;
		let flag = false;

		for (let i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
			const sx = poly[i].x;
			const sy = poly[i].y;
			const tx = poly[j].x;
			const ty = poly[j].y;

			// 点与多边形顶点重合
			if ((sx === px && sy === py) || (tx === px && ty === py)) {
				return true;
			}

			// 判断线段两端点是否在射线两侧
			if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
				// 线段上与射线 Y 坐标相同的点的 X 坐标
				const x = sx + ((py - sy) * (tx - sx)) / (ty - sy);

				// 点在多边形的边上
				if (x === px) {
					return true;
				}

				// 射线穿过多边形的边界
				if (x > px) {
					flag = !flag;
				}
			}
		}

		// 射线穿过多边形边界的次数为奇数时点在多边形内
		return flag;
	}

	function intersectsByLinearRings(LinearRing1, LinearRings2) {
		let intersect = false;
		let segs1 = getSortedSegments(LinearRing1);
		let segs2 = getSortedSegments(LinearRings2);

		let seg1, seg1x1, seg1x2, seg1y1, seg1y2, seg2, seg2y1, seg2y2;
		// sweep right
		for (let i = 0, len = segs1.length; i < len; ++i) {
			seg1 = segs1[i];
			seg1x1 = seg1.x1;
			seg1x2 = seg1.x2;
			seg1y1 = seg1.y1;
			seg1y2 = seg1.y2;
			for (let j = 0, jlen = segs2.length; j < jlen; ++j) {
				seg2 = segs2[j];
				if (seg2.x1 > seg1x2) {
					// seg1 still left of seg2
					break;
				}
				if (seg2.x2 < seg1x1) {
					// seg2 still left of seg1
					continue;
				}
				seg2y1 = seg2.y1;
				seg2y2 = seg2.y2;
				if (Math.min(seg2y1, seg2y2) > Math.max(seg1y1, seg1y2)) {
					// seg2 above seg1
					continue;
				}
				if (Math.max(seg2y1, seg2y2) < Math.min(seg1y1, seg1y2)) {
					// seg2 below seg1
					continue;
				}
				if (segmentsIntersect(seg1, seg2)) {
					intersect = true;
					return intersect;
				}
			}
		}
		return intersect;
	}

	function getSortedSegments(points) {
		let numSeg = points.length - 1;
		let segments = new Array(numSeg);
		let point1;
		let point2;
		for (let i = 0; i < numSeg; ++i) {
			point1 = points[i];
			point2 = points[i + 1];
			if (point1.x < point2.x) {
				segments[i] = {
					x1: point1.x,
					y1: point1.y,
					x2: point2.x,
					y2: point2.y,
				};
			} else {
				segments[i] = {
					x1: point2.x,
					y1: point2.y,
					x2: point1.x,
					y2: point1.y,
				};
			}
		}
		// more efficient to define this somewhere static
		function byX1(seg1, seg2) {
			return seg1.x1 - seg2.x1;
		}
		return segments.sort(byX1);
	}

	function segmentsIntersect(seg1, seg2) {
		let intersection = false;
		let d =
			(seg2.y2 - seg2.y1) * (seg1.x2 - seg1.x1) -
			(seg2.x2 - seg2.x1) * (seg1.y2 - seg1.y1);
		let n1 =
			(seg2.x2 - seg2.x1) * (seg1.y1 - seg2.y1) -
			(seg2.y2 - seg2.y1) * (seg1.x1 - seg2.x1);
		let n2 =
			(seg1.x2 - seg1.x1) * (seg1.y1 - seg2.y1) -
			(seg1.y2 - seg1.y1) * (seg1.x1 - seg2.x1);
		if (d == 0) {
			// parallel
			if (n1 == 0 && n2 == 0) {
				// coincident
				intersection = true;
			}
		} else {
			let along1 = n1 / d;
			let along2 = n2 / d;
			if (along1 >= 0 && along1 <= 1 && along2 >= 0 && along2 <= 1) {
				intersection = true;
			}
		}
		return intersection;
	}

	function transformPointArrayToPointXY(polygonLinearRings) {
		return polygonLinearRings.map(point => {
			return {
				x: point[0],
				y: point[1]
			};
		});
	}

	function intersectsPolygonAndPolygon(
		polygon1LinearRings,
		polygon2LinearRings
	) {
		return intersectsByPolygon(polygon1LinearRings, polygon2LinearRings);
	}

	const {payload, col, row} = data;
	const [polygon1, polygon2] = payload;
	const p1 = transformPointArrayToPointXY(polygon1[0]);
	const p2 = transformPointArrayToPointXY(polygon2[0]);
	return {
		res: intersectsPolygonAndPolygon(p1, p2) ? 1 : 0,
		col,
		row
	}
}

const workerPool = new Map();
const maxThread = navigator.hardwareConcurrency;

const buildGraphMatrix = function (coordinates) {
	let len = coordinates.length;
	const matrix = coordinates.map(() => []);
	function storeResult({ res, col, row }) {
		matrix[row][col] = res;
	}

	let coordinatePairs = [];
	for (let i = 0; i < len - 1; i++) {
		for (let j = i + 1; j < len; j++) {
			coordinatePairs.push({
				payload: [coordinates[i], coordinates[j]],
				row: i,
				col: j
			});
		}
	}

	const wrapper = (query, uuid, poolIdx) => {
		return query.then(result => {
			storeResult(result);
			return { uuid, poolIdx }
		})
	};
	
	const workerRunningPool = coordinatePairs.slice(0, maxThread).map((data, index) => {
		const worker = new DynamicWorker(messageHandler);
		workerPool.set(worker.uuid, worker);
		return wrapper(worker.send(data), worker.uuid, index)
	});

	const lastRace = coordinatePairs.reduce((prev, next) => {
		return prev.then(() => Promise.race(workerRunningPool)).then(({ uuid, poolIdx }) => {
			const worker = workerPool.get(uuid);
			workerRunningPool.splice(poolIdx, 1, wrapper(worker.send(next), uuid, poolIdx));
		})
	}, Promise.resolve());

	return lastRace.then(() => {
		return Promise.all(workerRunningPool).then(() => {
			for (let i = 0; i < len; i++) {
				for (let j = 0; j < len; j++) {
					if (i === j) {
						matrix[i][j] = 0;
					}
					if (i > j) {
						matrix[i][j] = matrix[j][i];
					}
				}
			}
			return matrix;
		});
	})
};

const calcFourColorReleation = function (matrix, task) {
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
			task && task('render', matrixWeight[i].idx, answer[i]);
			i++;
			track[i] = 0;
		} else {
			task && task('clear', i, answer[i]);
			i--;
			answer.pop();
		}
	}
	return matrixWeight.reduce((acc, { idx }, index) => {
		acc[idx] = answer[index];
		return acc;
	}, []);
};

const calcReleations = async function(coordinates) {
	const matrix = await buildGraphMatrix(coordinates);
	return calcFourColorReleation(matrix);
};

export { buildGraphMatrix, calcFourColorReleation, calcReleations };
