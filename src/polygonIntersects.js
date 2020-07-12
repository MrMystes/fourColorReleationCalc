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

export function intersectsPolygonAndPolygon(
  polygon1LinearRings,
  polygon2LinearRings
) {
  return intersectsByPolygon(polygon1LinearRings, polygon2LinearRings);
}
