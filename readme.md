# four-color-releation-calc
用于计算n个多边形的四色关系


## 设计思路
该计算方法按照geojson标准进行设计， 如 Polygon是闭合线的一维数组，是坐标的二维数组

eg: point: `[120.31, 31.31]`
    闭合线 `[[120.31, 31.31], [121.31, 31.31], [121.31, 30.31], [120.31, 30.31], [120.31, 31.31]]`
    polygon `[[[120.31, 31.31], [121.31, 31.31], [121.31, 30.31], [120.31, 30.31], [120.31, 31.31]]]`
1. 对一批多边形数据,两两计算多边形的相邻关系，根据相邻关系，构建出无向图，并使用二维矩阵来描述这个无向图
2. 对二维矩阵进行重排，以相邻节点的数量作为权重，根据权重，重新构建无向图的二维矩阵；（参考了Welsh Powerll Graph colouring Algorithm）
3. 通过回溯算法，计算四

## API

`buildGrapMatrix` 传入一个长度为n的polygon的数组，通过两两计算polygon之间的相邻关系，构建二维矩阵

`calcReleations` 输入无向图的二维矩阵，通过贪婪算法重构矩阵，通过回溯算法进行上色，最终按照原顺序，输出四色结果

```javascript
    const polygons = [polygon * n] // n个polygon
    const matrix = buildGrapMatrix(polygons)
    // answer的顺序，和原始的polygons顺序一致
    // answer就是一个数组，类似于这样的形式，[1,2,2,3,4,1,2,3]; （1，2，3，4）代表上色的次序
    const answer = calcReleations(matrix);
```
## example

https://mrmystes.github.io/

![](/assets/example.png)