const fs = require('fs');
import React from 'react';
import * as d3 from 'd3';
import * as loam from 'loam';
import * as GeoTIFF from 'geotiff';
import './Map.css';

type Props = {
  populationFile: string;
};

type State = {
  value: number;
  width: any;
  height: any;
  geography: any;
  population: any;
  geographyColors: any;
  populationColors: any;
  tx: number;
  ty: number;
  tk: number;
  svg: any;
  paths: any;
  mx: number;
  my: number;
};

const path = d3.geoPath();

export default class Map extends React.Component<Props, State> {
  threshold = 10000;

  constructor(props: any) {
    super(props);
    this.setState({ tx: 0, ty: 0, tk: 1 });
  }

  async componentDidMount() {
    try {
      const populationFile = await fetch(this.props.populationFile);
      const blob = await populationFile.blob();

      const gdal = await loam.open(blob);
      const transform = await gdal.transform();
      console.log(transform);

      const buffer = await populationFile.arrayBuffer();
      const tiff = await GeoTIFF.fromArrayBuffer(buffer);
      const image = await tiff.getImage();
      const width = image.getWidth();
      const height = image.getHeight();
      const rasters: any[] = await image.readRasters();
      const raster: number[] = rasters[0].map((d: number) => {
        return d < 0 ? -1 : d === 0 ? 0 : Math.round(d);
      });

      const geographyData = raster;
      const populationData = raster;

      const geographyExtents = d3.extent(geographyData) as number[];
      const populationExtents = d3.extent(populationData) as number[];

      const geographyTicks = d3.ticks(
        geographyExtents[0],
        geographyExtents[1],
        2
      );
      const populationTicks = d3.ticks(
        this.threshold,
        populationExtents[1],
        150
      );

      const geographyContours = d3
        .contours()
        .smooth(false)
        .size([width, height])
        .thresholds(geographyTicks);

      const populationContours = d3
        .contours()
        .smooth(false)
        .size([width, height])
        .thresholds(populationTicks);

      const geography = Array.from(geographyContours(geographyData));

      const population = Array.from(populationContours(populationData));

      const geographyColors = d3
        .scaleThreshold<number, string>()
        .domain(geographyExtents)
        .range(['#000000']);

      const populationColors = d3.scaleSequential(
        [1, populationExtents[1] * 0.1, populationExtents[1]],
        d3.interpolateHcl('red', 'white') // d3.interpolateMagma
      );

      this.setState({
        width,
        height,
        geography,
        population,
        geographyColors,
        populationColors,
        tx: 0,
        ty: 0,
        tk: 1,
        svg: null,
        paths: [],
        mx: 0,
        my: 0,
      });

      this.setState({
        paths: this.geography.concat(this.population),
      });
    } catch (err) {
      console.error(err);
    }
  }

  onRef(node: SVGSVGElement) {
    const { width, height, svg } = this.state;
    if (svg) return;

    const zoom = d3
      .zoom()
      .scaleExtent([1, 15])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, any>) => {
        const xform = event.transform;
        this.setState({ tx: xform.x, ty: xform.y, tk: xform.k });
      }) as any;

    d3.select(node).call(zoom);
    this.setState({ svg: node });
  }

  hover(event: React.MouseEvent) {
    this.setState({ mx: event.clientX, my: event.clientY });
  }

  get geography(): React.SVGProps<SVGPathElement>[] {
    const { geography, geographyColors } = this.state;
    return Array.from(geography, (datum: any, i: number) => {
      return (
        <path
          key={'geo-' + i}
          d={path(datum) || undefined}
          fill={geographyColors(datum.value)}
        />
      );
    });
  }

  get population(): React.SVGProps<SVGPathElement>[] {
    const { population, populationColors } = this.state;
    return Array.from(population, (datum: any, i: number) => {
      return (
        <path
          key={'pop-' + i}
          d={path(datum) || undefined}
          fill={populationColors(datum.value)}
          onMouseOver={() => {
            this.setState({ value: datum.value });
          }}
        />
      );
    });
  }

  // get borders(): React.SVGProps<SVGPathElement>[] {
  //   const { width, height, borders } = this.state;
  //   const projection = d3
  //     .geoEquirectangular()
  //     .fitSize([width, height], borders);
  //   const geoPath = d3.geoPath(projection);
  //   return borders.features.map((feature: any, i: number) => {
  //     return (
  //       <path
  //         key={'admin-' + i}
  //         d={geoPath(feature) || undefined}
  //         stroke="white"
  //         strokeWidth="1"
  //       />
  //     );
  //   });
  // }

  render() {
    if (!this.state) return null;

    const { value, width, height, tx, ty, tk, mx, my, paths } = this.state;

    return (
      <div className={'container'} onMouseMove={this.hover.bind(this)}>
        <div className={'tooltip'} style={{ left: mx, top: my }}>
          <span>Population: {value}</span>
        </div>
        <svg
          ref={this.onRef.bind(this)}
          className={'map'}
          viewBox={`0 0 ${width} ${height}`}
        >
          <g transform={`translate(${tx}, ${ty}) scale(${tk})`}>{paths}</g>
        </svg>
      </div>
    );
  }
}
