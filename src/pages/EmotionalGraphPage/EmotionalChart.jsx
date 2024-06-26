import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import ChartLegend from './../../components/ChartLegend';
import emotionList from '../../contants/emotions.json';
import { IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { getEmotionMap } from '../../utils/emotions';

const EmotionalChart = ({
  events,
  filters,
  onClickCreate,
  onClickEdit,
  onClickDelete,
  onClickView,
}) => {
  const [zoom, setZoom] = useState(50);
  const [width, setWidth] = useState(document.documentElement.clientWidth);
  const [height, setHeight] = useState(
    document.documentElement.clientHeight - 48,
  );
  const refSvg = useRef();
  const refContainer = useRef();
  const refNodes = useRef();
  const refLinks = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

  const nodes = events.map((event) => ({
    ...(refNodes.current?.find((node) => node.id === event.id) ?? {}),
    ...event,
  }));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const links = nodes.reduce((acc, curr) => {
    curr.relationships.followed_by.forEach((event) => {
      if (nodeIds.has(event)) {
        acc.push({
          ...refLinks.current.find(
            (link) => link.source.id === curr.id && link.target.id === event,
          ),
          source: curr.id,
          target: event,
          type: 'result',
        });
      }
    });
    curr.relationships.preceded_by.forEach((event) => {
      if (nodeIds.has(event)) {
        acc.push({
          ...refLinks.current.find(
            (link) => link.source.id === event && link.target.id === curr.id,
          ),
          source: event,
          target: curr.id,
          type: 'result',
        });
      }
    });
    return acc;
  }, []);

  const types = Array.from(new Set(links.map((d) => d.type)));
  const color = d3.scaleOrdinal(types, d3.schemeCategory10);

  const emotions = getEmotionMap();

  const calculateSvgSize = () => {
    setWidth(refContainer.current.clientWidth);
    setHeight(refContainer.current.clientHeight);
  };

  useEffect(() => {
    const svgElement = d3.select(refSvg.current);
    loadChart(svgElement);
    return () => d3.select(refSvg.current).selectAll('*').remove();
  }, [events, filters, zoom]);

  useEffect(() => {
    window.addEventListener('resize', calculateSvgSize);
    return () => window.removeEventListener('resize', calculateSvgSize);
  }, [calculateSvgSize]);

  const linkArc = (d) => {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    return `
      M${d.source.x},${d.source.y}
      A${0},${0} 0 0,1 ${d.target.x},${d.target.y}
    `;
  };

  const drag = (simulation) => {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  const loadChart = (svg) => {
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .strength(() => 0.1)
          .distance(() => 100)
          .id((d) => d.id),
      )
      .force('charge', d3.forceManyBody().strength(-500))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    svg
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('width', width)
      .attr('height', height)
      .attr('role', 'img')
      .attr('area-label', 'Emotions node graph')
      .attr('style', 'font: 12px sans-serif;')
      .attr('transform', `scale(${zoom / 50})`);
    // .call(
    //   d3.zoom().on('zoom', (e) => {
    //     svg.attr('transform', e.transform);
    //   }),
    // )

    svg
      .append('defs')
      .selectAll('marker')
      .data(types)
      .join('marker')
      .attr('id', (d) => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 40)
      .attr('refY', -1.5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', color)
      .attr('d', 'M0,-5L10,0L0,5');

    const link = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('stroke', (d) => color(d.type))
      .attr(
        'marker-end',
        (d) => `url(${new URL(`#arrow-${d.type}`, location)})`,
      );

    const node = svg
      .append('g')
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('stroke', 'gray')
      .attr('stroke-width', 0.4)
      .selectAll('g')
      .data(nodes)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .join('g')
      .call(drag(simulation));

    node
      .on('mouseover', function (e) {
        const data = e.target.__data__;
        d3.select(this).attr('stroke', 'white');
        d3.select(this).attr('stroke-width', 5);
        if (e.target.__data__.name !== 'Myself') {
          d3.select(`#edit-button-${data.id}`).style('display', 'block');
          d3.select(`#delete-button-${data.id}`).style('display', 'block');
          d3.select(`#view-button-${data.id}`).style('display', 'block');
        }
        d3.select(`#create-button-${data.id}`).style('display', 'block');
      })
      .on('mouseout', function (e) {
        const data = e.target.__data__;
        d3.select(this).attr('stroke', 'gray');
        d3.select(this).attr('stroke-width', 0.4);
        d3.select(`#edit-button-${data.id}`).style('display', 'none');
        d3.select(`#create-button-${data.id}`).style('display', 'none');
        d3.select(`#delete-button-${data.id}`).style('display', 'none');
        d3.select(`#view-button-${data.id}`).style('display', 'none');
      });

    const nodeCircle = node.append('g').attr('cursor', 'grab');

    nodes.forEach((node) => {
      const primaryColor = emotions[node?.emotions[0]]?.color ?? 'white';
      const secondaryColor = emotions[node?.emotions[1]]?.color ?? primaryColor;
      const gradient = svg
        .append('linearGradient')
        .attr('id', `gradient-circle-${node.id}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%');

      gradient
        .append('stop')
        .attr('offset', '30%')
        .attr('stop-color', `${primaryColor}`)
        .attr('stop-opacity', 1);

      gradient
        .append('stop')
        .attr('offset', '70%')
        .attr('stop-color', `${secondaryColor}`)
        .attr('stop-opacity', 1);
    });

    nodeCircle
      .append('circle')
      .attr('r', 25)
      .attr('fill', (d) => `url(#gradient-circle-${d.id})`)
      .attr('opacity', (d) => (d.visible ? 1 : 0.2));
    const editButton = node
      .append('g')
      .data(nodes)
      .attr('id', (d) => `edit-button-${d.id}`)
      .attr('transform', `translate(22, -19)`)
      .attr('role', 'button')
      .attr('area-label', 'Edit event')
      .style('cursor', 'pointer')
      .style('display', 'none')
      .attr('stroke', 'gray')
      .attr('stroke-width', 0.6)
      .on('click', (event) => {
        event.stopPropagation();
        onClickEdit(event);
      });

    editButton.append('circle').attr('r', 10).attr('fill', 'white');

    editButton
      .append('path')
      .attr('transform', `translate(-8, -8) scale(0.7)`)
      .attr('fill', 'gray')
      .attr('stroke', 'gray')
      .attr('stroke-width', 0.3)
      .attr(
        'd',
        'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z',
      );

    const createButton = node
      .append('g')
      .data(nodes)
      .attr('id', (d) => `create-button-${d.id}`)
      .attr('transform', `translate(-20, 20)`)
      .style('cursor', 'pointer')
      .style('display', 'none')
      .attr('stroke', 'gray')
      .attr('stroke-width', 0.4)
      .on('click', (event) => {
        event.stopPropagation();
        onClickCreate(event);
      });

    createButton.append('circle').attr('r', 10).attr('fill', 'white');

    createButton
      .append('path')
      .attr('transform', `translate(-9, -8) scale(0.7)`)
      .attr('fill', 'gray')
      .attr('stroke', 'gray')
      .attr('d', 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z');

    const deleteButton = node
      .append('g')
      .data(nodes)
      .attr('id', (d) => `delete-button-${d.id}`)
      .attr('transform', `translate(20, 20)`)
      .style('cursor', 'pointer')
      .style('display', 'none')
      .attr('stroke', 'gray')
      .attr('stroke-width', 0.4)
      .on('click', (event) => {
        event.stopPropagation();
        onClickDelete(event);
      });

    deleteButton.append('circle').attr('r', 10).attr('fill', 'white');

    deleteButton
      .append('path')
      .attr('transform', `translate(-8, -8) scale(0.7)`)
      .attr('fill', 'red')
      .attr('stroke', 'red')
      .attr('stroke-width', 0.3)
      .attr(
        'd',
        'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
      );

    const viewButton = node
      .append('g')
      .data(nodes)
      .attr('id', (d) => `view-button-${d.id}`)
      .attr('transform', `translate(-20, -19)`)
      .style('cursor', 'pointer')
      .style('display', 'none')
      .attr('stroke', 'gray')
      .attr('stroke-width', 0.4)
      .on('click', (event) => {
        event.stopPropagation();
        onClickView(event);
      });

    viewButton.append('circle').attr('r', 10).attr('fill', 'white');

    viewButton
      .append('path')
      .attr('transform', `translate(-9, -8) scale(0.7)`)
      .attr('fill', 'gray')
      .attr('stroke', 'gray')
      .attr('stroke-width', 0.3)
      .attr(
        'd',
        'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3',
      );

    node
      .append('text')
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .attr('font-width', '700')
      .attr('stroke', 'black')
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 0.4)
      .text((d) => d.name);

    simulation.on('tick', () => {
      refNodes.current = JSON.parse(JSON.stringify(nodes));
      refLinks.current = JSON.parse(JSON.stringify(links));
      link.attr('d', linkArc);
      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });
  };

  return (
    <>
      <div
        ref={refContainer}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', left: 0, right: 0, top: 10 }}>
          <ChartLegend emotionList={emotionList.children} />
        </div>
        <div
          style={{
            position: 'absolute',
            right: isMobile ? 20 : '50%',
            zIndex: 100,
            transform: 'translate(50%, 0)',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            bottom: 10,
          }}
        >
          <Tooltip describeChild title='Zoom in' arrow placement='top'>
            <IconButton aria-label='Zoom in' onClick={() => setZoom(zoom + 5)}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip describeChild title='Zoom out' arrow placement='top'>
            <IconButton aria-label='Zoom out' onClick={() => setZoom(zoom - 5)}>
              <RemoveIcon />
            </IconButton>
          </Tooltip>
        </div>
        <svg
          ref={refSvg}
          style={{ height: '100%', width: '100%' }}
          width={width}
          height={height}
        />
      </div>
    </>
  );
};

export default EmotionalChart;
