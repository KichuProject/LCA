import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from 'd3-sankey';

interface SankeyNodeData {
  name: string;
}

interface SankeyLinkData {
  source: number;
  target: number;
  value: number;
}

interface SankeyData {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
}

interface SankeyChartProps {
  data: SankeyData;
  width?: number;
  height?: number;
}

const SankeyChart: React.FC<SankeyChartProps> = ({ data, width = 700, height = 400 }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    console.log('SankeyChart received data:', data);
    console.log('SVG ref:', svgRef.current);
    
    if (!data || !data.nodes || !data.links || data.nodes.length === 0) {
      console.log('No data available for Sankey chart');
      // Clear SVG if no data
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove();
      }
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const { nodes, links } = data;

    // Validate links to ensure they reference valid node indices
    const validLinks = links.filter(link => 
      link.source >= 0 && link.source < nodes.length &&
      link.target >= 0 && link.target < nodes.length &&
      link.value > 0
    );

    if (validLinks.length === 0) {
      console.warn('No valid links for Sankey diagram');
      return;
    }

    try {
      const sankeyGenerator = sankey<SankeyNodeData, SankeyLinkData>()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 1], [width - 1, height - 6]]);

      const sankeyData = sankeyGenerator({
        nodes: nodes.map(d => ({ ...d })) as SankeyNode<SankeyNodeData, SankeyLinkData>[],
        links: validLinks.map(d => ({ ...d })) as SankeyLink<SankeyNodeData, SankeyLinkData>[]
      });

      const { nodes: graphNodes, links: graphLinks } = sankeyData;

      if (!graphNodes || !graphLinks || graphNodes.length === 0) {
        console.warn('Sankey generator returned no valid data');
        return;
      }

      // Define color scale
      const color = d3.scaleOrdinal(d3.schemeCategory10);

      // Draw links
      svg.append('g')
        .selectAll('path')
        .data(graphLinks)
        .join('path')
        .attr('d', sankeyLinkHorizontal())
        .attr('stroke', (d: any) => color((d.source as any).name))
        .attr('stroke-width', (d: any) => Math.max(1, d.width))
        .attr('fill', 'none')
        .attr('opacity', 0.5)
        .append('title')
        .text((d: any) => `${(d.source as any).name} → ${(d.target as any).name}
${d.value}`);

      // Draw nodes
      svg.append('g')
        .selectAll('rect')
        .data(graphNodes)
        .join('rect')
        .attr('x', (d: any) => d.x0)
        .attr('y', (d: any) => d.y0)
        .attr('height', (d: any) => d.y1 - d.y0)
        .attr('width', (d: any) => d.x1 - d.x0)
        .attr('fill', (d: any) => color(d.name))
        .attr('stroke', '#000')
        .append('title')
        .text((d: any) => `${d.name}
${d.value}`);

      // Add node labels
      svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .selectAll('text')
        .data(graphNodes)
        .join('text')
        .attr('x', (d: any) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr('y', (d: any) => (d.y1 + d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', (d: any) => d.x0 < width / 2 ? 'start' : 'end')
        .text((d: any) => d.name);

    } catch (error) {
      console.error('Error rendering Sankey chart:', error);
    }
  }, [data, width, height]);

  return (
    <div className="sankey-container">
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #ccc' }}>
        {/* Fallback content */}
        <text x={width/2} y={height/2} textAnchor="middle" fill="#666">
          Loading Sankey Chart...
        </text>
      </svg>
    </div>
  );
};

export default SankeyChart;
