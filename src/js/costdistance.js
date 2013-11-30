/*globals MinHeap */

var MA = MA || {};

(function() {
  MA.NODATA = -1;

  function getCost (raster, r1, c1, r2, c2) {
    // Handle NODATA
    if (raster[r1][c1] === MA.NODATA || raster[r2][c2] === MA.NODATA) {
      return NaN;
    }

    if (r1 === r2 || c1 === c2) {
      // if perpendicular
      return (raster[r1][c1] + raster[r2][c2]) / 2;
    } else {
      // if diagonal
      return 1.414214 * (raster[r1][c1] + raster[r2][c2]) / 2;
    }
  }

  MA.costDistance = function(costRaster, sourceRaster, maxCost) {
    var rowCnt = costRaster.length,
        colCnt = costRaster[0].length,

        costDistanceRaster = [],

        // Min heap of cells to process
        heap = new MinHeap(null, function(a, b) {
          return a.cost === b.cost ? 0 : a.cost < b.cost ? -1 : 1;
        }),

        undef,
        neighbor, row, col, rlen, clen,
        curCell, curCost, tempAccumCost;

    // Init the input raster to the size as the cost raster
    for (row=0, rlen=costRaster.length; row<rlen; row++) {
      costDistanceRaster[row] = [];
    }

    // In the first iteration, the source cells are identified and assigned to zero
    // since there is no accumulative cost to return to themselves.
    for (row=0, rlen=sourceRaster.length; row<rlen; row++) {
      for (col=0, clen=sourceRaster[row].length; col<clen; col++) {
        if (sourceRaster[row][col] > 0) {
          costDistanceRaster[row][col] = 0;

          heap.push({
            row: row,
            col: col,
            cost: 0
          });
        }
      }
    }

    // Iterate over the heap, starting with the min accumulated cost
    while (heap.size()) {
      curCell = heap.pop();

      // Process only if the current cost is less than the max cost
      if (!maxCost || (maxCost && curCell.cost < maxCost)) {
        row = curCell.row;
        col = curCell.col;

        /*
         *  Order in which the neighbors are visited
         *  5  3  6
         *  1  X  2
         *  8  4  7
         */

        for (neighbor = 1; neighbor <= 8; neighbor++) {
          switch (neighbor) {
            case 1:
              col = curCell.col - 1;
              // cur_dir = 360.0;
              break;
            case 2:
              col = curCell.col + 1;
              // cur_dir = 180.0;
              break;
            case 3:
              row = curCell.row - 1;
              col = curCell.col;
              // cur_dir = 270.0;
              break;
            case 4:
              row = curCell.row + 1;
              // cur_dir = 90.0;
              break;
            case 5:
              row = curCell.row - 1;
              col = curCell.col - 1;
              // cur_dir = 315.0;
              break;
            case 6:
              col = curCell.col + 1;
              // cur_dir = 225.0;
              break;
            case 7:
              row = curCell.row + 1;
              // cur_dir = 135.0;
              break;
            case 8:
              col = curCell.col - 1;
              // cur_dir = 45.0;
              break;
          }

          if (row >= 0 && row < rowCnt &&
              col >= 0 && col < colCnt) {

            curCost = getCost(costRaster, curCell.row, curCell.col, row, col);

            if (isNaN(curCost)) {
              costDistanceRaster[row][col] = NaN;
            } else {
              tempAccumCost = curCell.cost + curCost;

              if (costDistanceRaster[row][col] === undef ||
                  tempAccumCost < costDistanceRaster[row][col]) {

                // console.log('cost from ', curCell.row, curCell.col, 'to', row, col, 'is', curCost);
                // console.log(tempAccumCost, 'is less than', costDistanceRaster[row][col]);
                // console.log('---');

                costDistanceRaster[row][col] = tempAccumCost;

                heap.push({
                  row: row,
                  col: col,
                  cost: tempAccumCost
                });
              }
            }
          }
        }
      }
    }

    return costDistanceRaster;
  };

}(MA));