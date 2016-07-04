(function(window, document) {
    
    /**
     * Delaunay
     *
     * @see http://jsdo.it/akm2/wTcC
     */
    var Delaunay = (function() {

        /**
         * Node
         *
         * @param {Number} x
         * @param {Number} y
         * @param {Number} id
         */
        function Node(x, y, id) {
            this.x = x;
            this.y = y;
            this.id = !isNaN(id) && isFinite(id) ? id : null;
        }
        
        Node.prototype = {
            eq: function(point) {
                var dx = this.x - point.x;
                var dy = this.y - point.y;
                return (dx < 0 ? -dx : dx) < 0.0001 && (dy < 0 ? -dy : dy) < 0.0001;
            },
            
            toString: function() {
                return '(x: ' + this.x + ', y: ' + this.y + ')';
            }
            
        }
        
        /**
         * Edge
         *
         * @param {Node} p0
         * @param {Node} p1
         */
        function Edge(p0, p1) {
            this.nodes = [p0, p1];
        }

        Edge.prototype = {
            eq: function(edge) {
                var na = this.nodes,
                    nb = edge.nodes;
                var na0 = na[0], na1 = na[1],
                    nb0 = nb[0], nb1 = nb[1];
                return (na0.eq(nb0) && na1.eq(nb1)) || (na0.eq(nb1) && na1.eq(nb0));
            }
        };
        
        /**
         * Triangle
         *
         * @param {Node} p0
         * @param {Node} p1
         * @param {Node} p2
         */
        function Triangle(p0, p1, p2) {
            this.nodes = [p0, p1, p2];
            this.edges = [new Edge(p0, p1), new Edge(p1, p2), new Edge(p2, p0)];

            this.id = null;

            // 外接圆

            var circle = this.circle = new Object();

            var ax = p1.x - p0.x, ay = p1.y - p0.y,
                bx = p2.x - p0.x, by = p2.y - p0.y,
                t = (p1.x * p1.x - p0.x * p0.x + p1.y * p1.y - p0.y * p0.y),
                u = (p2.x * p2.x - p0.x * p0.x + p2.y * p2.y - p0.y * p0.y);

            var s = 1 / (2 * (ax * by - ay * bx));

            circle.x = ((p2.y - p0.y) * t + (p0.y - p1.y) * u) * s;
            circle.y = ((p0.x - p2.x) * t + (p1.x - p0.x) * u) * s;

            var dx = p0.x - circle.x;
            var dy = p0.y - circle.y;
            circle.radiusSq = dx * dx + dy * dy;
        }
        
        /**
         * Delaunay
         *
         * @param {Number} width
         * @param {Number} height
         */
        function Delaunay(width, height) {
            this.width = width;
            this.height = height;

            this._triangles = null;

            this.clear();
        }
        
        Delaunay.prototype = {
            
            clear: function() {
                var p0 = new Node(0, 0);
                var p1 = new Node(this.width, 0);
                var p2 = new Node(this.width, this.height);
                var p3 = new Node(0, this.height);

                this._triangles = [
                    new Triangle(p0, p1, p2),
                    new Triangle(p0, p2, p3)
                ];

                return this;
            },

            insert: function(points) {
                var k, klen, i, ilen, j, jlen;
                var triangles, t, temps, edges, edge, polygon;
                var x, y, circle, dx, dy, distSq;

                for (k = 0, klen = points.length; k < klen; k++) {
                    x = points[k][0];
                    y = points[k][1];

                    triangles = this._triangles;
                    temps = [];
                    edges = [];

                    for (ilen = triangles.length, i = 0; i < ilen; i++) {
                        t = triangles[i];

                        circle  = t.circle;
                        dx = circle.x - x;
                        dy = circle.y - y;
                        distSq = dx * dx + dy * dy;

                        if (distSq < circle.radiusSq) {
                            edges.push(t.edges[0], t.edges[1], t.edges[2]);
                        } else {
                            temps.push(t);
                        }
                    }

                    polygon = [];

                    edgesLoop: for (ilen = edges.length, i = 0; i < ilen; i++) {
                        edge = edges[i];

                        for (jlen = polygon.length, j = 0; j < jlen; j++) {
                            if (edge.eq(polygon[j])) {
                                polygon.splice(j, 1);
                                continue edgesLoop;
                            }
                        }

                        polygon.push(edge);
                    }

                    for (ilen = polygon.length, i = 0; i < ilen; i++) {
                        edge = polygon[i];
                        temps.push(new Triangle(edge.nodes[0], edge.nodes[1], new Node(x, y)));
                    }

                    this._triangles = temps;
                }

                return this;
            },

            getTriangles: function() {
                return this._triangles.slice();
            }
        }
        
        Delaunay.Node = Node;
        return Delaunay;
        
    })();

    /**
     * Point
     *
     * @super Delaunay.Node
     */
    function Point(x, y) {
        this.x = x;
        this.y = y;
        this.id = null;
    }

    Point.prototype = new Delaunay.Node();
    
})(window, window.document);