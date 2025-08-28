

interface linkProps {
  name: string;
  target_type: string;
  subgroup?: Array<any>;
  target?: any;
}
interface nodeLinkListProps extends linkProps {
    source: nodeExtendedProps, 
    target: nodeExtendedProps, 
    exists: number;
}
interface nodeProps {
    id: string;
    title: string;
    type: string;
    category: string;
    links?: Array<linkProps>;
}
interface nodeExtendedProps extends nodeProps {
    name: string;
    count: number;
}

interface nodeExtendedPropsLinksRequiered extends nodeExtendedProps {
    links: Array<linkProps>;
}
interface createNodesAndEdgesProps {
  dictionary: {
    [key: string]: nodeProps;
  };
  counts_search?: { [key: string]: number };
  links_search?: { [key: string]: number };
}

interface nameEdgesInProps {
    [key: string]: nodeLinkListProps[];
}
interface nodesByIdProps {
  [key: string]: nodeExtendedProps;
}

/**
 * Get subgroup links from link
 * @param {object} link - array of links
 * @param {object} nameToNode - key (node name) value (node object) map
 * @param {string} sourceId - source id for subgroup links
 * This function traverse links recursively and return all nested subgroup lnks
 */
const getSubgroupLinks = (link: nodeLinkListProps, nameToNode: {
    [key: string]: nodeProps;
}, sourceId: string) => {
  let subgroupLinks: nodeLinkListProps[] = [];
  if (link.subgroup) {
    link.subgroup.forEach((sgLink) => {
      if (sgLink.subgroup) {
        subgroupLinks = subgroupLinks.concat(getSubgroupLinks(sgLink, nameToNode, sourceId));
      } else {
        subgroupLinks.push({
          source: nameToNode[sourceId],
          target: nameToNode[sgLink.target_type],
          exists: 1,
          ...sgLink,
        });
      }
    });
  }
  return subgroupLinks;
};


/**
 * Given a data dictionary that defines a set of nodes
 *    and edges, returns the nodes and edges in correct format
 *
 * @method createNodesAndEdges
 * @param props: Object (normally taken from redux state) that includes dictionary
 *    property defining the dictionary as well as other optional properties
 *    such as counts_search and links_search (created by getCounts) with
 *    information about the number of each type (node) and link (between
 *    nodes with a link's source and target types) that actually
 *    exist in the data
 * @param createAll: Include all nodes and edges or only those that are populated in
 *    counts_search and links_search
 * @param nodesToHide: Array of nodes to hide from graph
 * @returns { nodes, edges } Object containing nodes and edges
 */
export function createNodesAndEdges(props: createNodesAndEdgesProps, createAll: boolean, nodesToHide = ['program']) {
  const { dictionary } = props;
  const nodes = Object.keys(dictionary).filter(
    (key) => !key.startsWith('_') && dictionary[key].type === 'object'
      && dictionary[key].category !== 'internal' && !nodesToHide.includes(key),
  ).map(
    (key) => {
      let count = 0;
      if (props.counts_search) {
        count = props.counts_search[`_${key}_count`];
      }
      return {
        name: dictionary[key].title,
        count,
        ...dictionary[key],
      };
    },
  ).filter(
    (node) => createAll || node.count !== 0,
  );

  const nameToNode = nodes.reduce((db: createNodesAndEdgesProps['dictionary'], node) => { db[node.id] = node; return db; }, {});

  const hideDb = nodesToHide.reduce((db: {[key: string]: boolean}, name) => { db[name] = true; return db; }, {});

  const edges = nodes.filter((node): node is nodeExtendedPropsLinksRequiered => node.links !== undefined && node.links.length > 0)
    .reduce( // add each node's links to the edge list
      (list: nodeLinkListProps[], node) => {
        const newLinks = node.links.map(
          (link) => ({
            source: node, target: nameToNode[link.target_type], exists: 1, ...link,
          }),
        );
        return list.concat(newLinks);
      }, [])
    .reduce( // add link subgroups to the edge list
      (list: nodeLinkListProps[], link) => {
        let result = list;
        if (link.target) { // "subgroup" link entries in dictionary are not links themselves ...
          result.push(link);
        }
        if (link.subgroup) {
          const sgLinks = getSubgroupLinks(link, nameToNode, link.source.id);
          result = result.concat(sgLinks);
        }
        return result;
      }, [])
    .filter(
    // target type exist and is not in hide list
      (link) => (link.target && link.target.id in nameToNode && !(link.target.id in hideDb)))
    .map(
      (link) => {
      // decorate each link with its "exists" count if available
      //  (number of instances of link between source and target types in the data)
        const res = link;
        res.exists = props.links_search
          ? props.links_search[`${res.source.id}_${res.name}_to_${res.target.id}_link`]
          : 0;
        return res;
      })
    .filter(
    // filter out if no instances of this link exists and createAll is not specified
      (link) => createAll || link.exists || link.exists === undefined,
    );
  return {
    nodes,
    edges,
  };
};

/**
 * Find the root of the given graph (no edges out)
 * @method findRoot
 * @param nodes
 * @param edges
 * @return {string} rootName or null if no root
 */
export function findRoot(nodes: nodeExtendedProps[], edges: nodeLinkListProps[]) {
  const couldBeRoot = edges.reduce(
    (db, edge) => {
      // At some point the d3 force layout converts
      //   edge.source and edge.target into node references ...
      const sourceName = typeof edge.source === 'object' ? edge.source.id : edge.source;
      if (db[sourceName]) {
        db[sourceName] = false;
      }
      return db;
    },
    // initialize emptyDb - any node could be the root
    nodes.reduce((emptyDb: {[key: string]: boolean}, node) => { 
      const res = emptyDb; 
      res[node.id] = true; 
      return res; 
    }, {}),
  );
  const rootNode = nodes.find((n) => couldBeRoot[n.id]);
  return rootNode ? rootNode.id : null;
}

/**
 * Recursive helper function for getTreeHierarchy
 * Returns the hierarchy of the tree in the form of a map
 * Each (key, value) consists of (node, node's descendants including the node itself)
 * @method getTreeHierarchyHelper
 * @param root
 * @param name2EdgesIn
 * @param hierarchy
 * @return {map}
 */
function getTreeHierarchyHelper(node: string, name2EdgesIn: nameEdgesInProps, hierarchy: Map<any, any>) {
  const descendants = new Set();
  descendants.add(node);
  hierarchy.set(node, descendants);
  name2EdgesIn[node].forEach((edge) => {
    const sourceName = typeof edge.source === 'object' ? edge.source.id : edge.source;
    if (!hierarchy.get(sourceName)) { // don't want to visit node again
      hierarchy = getTreeHierarchyHelper(sourceName, name2EdgesIn, hierarchy);
      descendants.add(sourceName);
      hierarchy.get(sourceName).forEach((n: any) => {
        descendants.add(n);
      });
    }
  });
  hierarchy.set(node, descendants);
  return hierarchy;
}

/**
 * Returns the hierarchy of the tree in the form of a map
 * Each (key, value) consists of (node, node's descendants including the node itself)
 * @method getTreeHierarchy
 * @param root
 * @param name2EdgesIn
 * @return {map}
 */
export function getTreeHierarchy(root: string, name2EdgesIn: nameEdgesInProps) {
  return getTreeHierarchyHelper(root, name2EdgesIn, new Map());
}

/**
 * Arrange nodes in dictionary graph breadth first, and build level database.
 * If a node links to multiple parents, then place it under the highest parent ...
 * Exported for testing.
 *
 * @param {Array} nodes
 * @param {Array} edges
 * @return { nodesBreadthFirst, treeLevel2Names, name2Level } where
 *          nodesBreadthFirst is array of node names, and
 *          treeLevel2Names is an array of arrays of node names,
 *          and name2Level is a mapping of node name to level
 */
export function nodesBreadthFirst(nodes: nodeExtendedProps[], edges: nodeLinkListProps[]) {
  const result: {
    bfOrder: string[],
    treeLevel2Names: Array<string[]>,
    name2Level: {[key: string]: number},
  } = {
    bfOrder: [],
    treeLevel2Names: [],
    name2Level: {},
  };

  // mapping of node name to edges that point into that node
  const name2EdgesIn = edges.reduce(
    (db: nameEdgesInProps, edge: nodeLinkListProps) => {
      // At some point the d3 force layout converts edge.source
      //   and edge.target into node references ...
      const targetName = typeof edge.target === 'object' ? edge.target.id : edge.target;
      if (db[targetName]) {
        db[targetName].push(edge);
      } else {
        console.error(`Edge points to unknown node: ${targetName}`);
      }
      return db;
    },
    // initialize emptyDb - include nodes that have no incoming edges (leaves)
    nodes.reduce((emptyDb: {[key: string]: []}, node: nodeExtendedProps) => { 
      const res = emptyDb; 
      res[node.id] = []; 
      return res; 
    }, {}),
  );

  // root node has no edges coming out of it, just edges coming in
  const root = findRoot(nodes, edges);
  if (!root) {
    console.log('Could not find root of given graph');
    return result;
  }

  const processedNodes = new Set(); // account for nodes that link to multiple other nodes
  let queue = [];
  queue.push({ query: root, level: 0 });

  // just 2b safe - could be user gives us a graph without a 'project'
  if (!name2EdgesIn[root]) {
    name2EdgesIn[root] = [];
  }

  const name2ActualLvl: {[key: string]: number} = {};
  const hierarchy = getTreeHierarchy(root, name2EdgesIn);
  // Run through this once to determine the actual level of each node
  for (let head = 0; head < queue.length; head += 1) {
    const { query, level } = queue[head]; // breadth first
    name2ActualLvl[query] = level;
    name2EdgesIn[query].forEach((edge) => {
      // At some point the d3 force layout converts edge.source
      //   and edge.target into node references ...
      const sourceName = typeof edge.source === 'object' ? edge.source.id : edge.source;
      if (name2EdgesIn[sourceName]) {
        const isAncestor = hierarchy.get(sourceName).has(query);
        // only push node if it is not an ancestor of the current node, or else --> cycle
        if (!isAncestor) {
          queue.push({ query: sourceName, level: level + 1 });
        }
      } else {
        console.log(`Edge comes from unknown node ${sourceName}`);
      }
    },
    );
  }

  // Reset and run for real
  queue = [];
  queue.push({ query: root, level: 0 });

  // queue.shift is O(n), so just keep pushing, and move the head
  for (let head = 0; head < queue.length; head += 1) {
    const { query, level } = queue[head]; // breadth first
    result.bfOrder.push(query);
    processedNodes.add(query);
    if (result.treeLevel2Names.length <= level) {
      result.treeLevel2Names.push([]);
    }
    result.treeLevel2Names[level].push(query);
    result.name2Level[query] = level;
    name2EdgesIn[query].forEach(
      (edge) => {
        // At some point the d3 force layout converts edge.source
        //   and edge.target into node references ...
        const sourceName = typeof edge.source === 'object' ? edge.source.id : edge.source;
        if (name2EdgesIn[sourceName]) {
          if (!processedNodes.has(sourceName) && name2ActualLvl[sourceName] === (level + 1)) {
            //
            // edge source has not yet been processed via another link from the source
            // to a node higher in the graph
            //
            processedNodes.add(sourceName); // don't double-queue a node
            queue.push({ query: sourceName, level: level + 1 });
          }
        } else {
          console.log(`Edge comes from unknown node ${sourceName}`);
        }
      },
    );
  }
  return result;
}


const placeNodesOnGraph = (treeLevel2Names: string[][], nodesById: nodesByIdProps)=> {
  let currentX = 0;
  let currentY = 0;
  const xSpacing = 300;
  const ySpacing = 100;

  const positions: {
    id: string;
    name: string; 
    x: number; 
    y: number 
  }[] = [];

  treeLevel2Names.forEach((level) => {
    level.forEach((id) => {
      positions.push({
        id: id,
        name: nodesById[id].name,
        x: currentX,
        y: currentY,
      });
      currentY += ySpacing;
    });
    currentY = 0;
    currentX += xSpacing;
  });

  return positions;
};

const linksForGraph = (edges: nodeLinkListProps[])=> {
  return edges.map((edge) => {
    return {
      source: edge.source.id,
      target: edge.target.id,
    };
  });
};

//TODO posably get this from somewhere else
  // object of nodes by ID for easy lookup
const getNodesById = (nodes: nodeExtendedProps[]) => {
  return nodes.reduce((db: nodesByIdProps, node: nodeExtendedProps) => { 
    db[node.id] = node; 
    return db; 
  }, {});
};

export const formatDataForGraph = (categories: any) => {
  //TODO cash all this unchanging data
  const { nodes, edges } = createNodesAndEdges({
    dictionary: categories,
  }, true, []);
  const nodeTree = nodesBreadthFirst(nodes, edges);
  console.log('nodes edges', nodes, edges);
  console.log('nodesBreadthFirst', nodeTree);
  const nodesById = getNodesById(nodes);
  const graphData = placeNodesOnGraph(nodeTree.treeLevel2Names, nodesById);
  console.log('placeNodesOnGraph', graphData);
  const graphLinks = linksForGraph(edges);
  console.log('linksForGraph', graphLinks);
  return {
    data: graphData,
    links: graphLinks,
  };
};
