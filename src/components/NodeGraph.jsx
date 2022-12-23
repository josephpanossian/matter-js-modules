import * as React from "react";
import * as Matter from "matter-js";

const NodeGraph = (props) => {
    const canvasRef = React.useRef();

    React.useEffect(() => {
        // Init Matter World
        const engine = Matter.Engine.create();
        const world = engine.world;

        // Init values
        const categories = {
            default: 0x0001,
            node: 0x0002,
        };
        engine.gravity.x = 0;
        engine.gravity.y = 0;
        let allNodes = [];
        let allSolidConnections = [];
        let allTransparentConnections = [];
        engine.timing.timeScale = 2;

        // create a new node object
        const createNode = (radius, color, pos) => {
            const node = Matter.Bodies.circle(pos.x, pos.y, radius, {
                render: {
                    fillStyle: color ?? "",
                },
                weight: 0.0000001,
                collisionFilter: {
                    category: categories.node,
                    mask: categories.default,
                },
            });
            const stiffness = 0.01;
            const length = Math.random() * props.canvasHeight * 10 + 800; //+ props.canvasHeight / 3;
            const randomNode =
                allNodes[Math.floor(Math.random() * allNodes.length)];
            if (allNodes.length > 0) {
                const constraint = Matter.Constraint.create({
                    bodyA: node,
                    bodyB: allNodes[0],
                    stiffness,
                    length,
                    render: {
                        visible: false,
                    },
                });
                Matter.Composite.add(world, constraint);
                allSolidConnections.push(constraint);
            }
            allNodes.push(node);
            Matter.Composite.add(world, node);
        };

        const circle = Matter.Bodies.circle(
            props.canvasWidth / 2,
            props.canvasHeight / 2,
            100,
            {
                render: {
                    fillStyle: "#ffffff",
                },
                collisionFilter: {
                    category: categories.node,
                    mask: categories.default,
                },
                mass: 100000,
            }
        );

        Matter.Composite.add(world, circle);
        allNodes.push(circle);
        // create circle
        for (let i = 0; i < 1000; i++) {
            createNode(40, undefined, {
                x:
                    Math.random() *
                    props.canvasWidth *
                    2 *
                    Matter.Common.choose([-1, 1]),
                y:
                    Math.random() *
                    props.canvasHeight *
                    2 *
                    Matter.Common.choose([-1, 1]),
            });
        }
        const canvas = canvasRef.current;
        const render = Matter.Render.create({
            element: canvas,
            engine: engine,
            options: {
                width: props.canvasWidth,
                height: props.canvasHeight,
                background: "rgb(32 33 37)",
                wireframes: false,
            },
        });
        const mouse = Matter.Mouse.create(canvas);
        // set mouse interactions
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            //Create Constraint
            mouse,
            constraint: {
                render: {
                    visible: false,
                },
                stiffness: 0.8,
            },
        });

        // fix scroll event listeners from mouseConstraint
        mouseConstraint.mouse.element.removeEventListener(
            "mousewheel",
            mouseConstraint.mouse.mousewheel
        );
        mouseConstraint.mouse.element.removeEventListener(
            "DOMMouseScroll",
            mouseConstraint.mouse.mousewheel
        );

        mouseConstraint.collisionFilter.mask =
            categories.default | categories.node;

        Matter.World.add(engine.world, mouseConstraint);
        render.mouse = mouse;

        // for (let i = 1; i < allNodes.length - 2; i++) {
        //     const stiffness = 1;
        //     const length = Math.random() * 300 + 100;
        //     const constraint = Matter.Constraint.create({
        //         bodyA: allNodes[i],
        //         bodyB: allNodes[i + 1],
        //         stiffness,
        //         length,
        //         render: {
        //             visible: false,
        //         },
        //     });
        //     Matter.Composite.add(world, constraint);
        // }
        Matter.Render.run(render);
        Matter.Runner.run(engine);

        let zoomX = props.canvasWidth;
        let zoomY = props.canvasHeight;
        Matter.Render.lookAt(render, allNodes[0], {
            x: zoomX,
            y: zoomY,
        });
        // handle scrolling on canvas
        const handleScroll = (event) => {
            // prevent default scrolling behaviors
            event.stopPropagation();
            event.preventDefault();

            const zoomSpeedMultiplier = 100;

            if (event.deltaY > 0) {
                // handle zoom out
                zoomX += zoomSpeedMultiplier;
                zoomY += zoomSpeedMultiplier;
                Matter.Render.lookAt(render, allNodes[0], {
                    x: zoomX,
                    y: zoomY,
                });
            } else if (event.deltaY <= 0 && zoomX > 750) {
                // handle zoom in
                zoomX -= zoomSpeedMultiplier;
                zoomY -= zoomSpeedMultiplier;
                Matter.Render.lookAt(render, allNodes[0], {
                    x: zoomX,
                    y: zoomY,
                });
            }
            // console.log("Updated Zoom: x:", zoomX, "y:", zoomY);
        };
        canvas.addEventListener("mousewheel", handleScroll, false);
        canvas.addEventListener("touchmove", handleScroll, false);
        return () => {
            Matter.Render.stop(render);
            Matter.World.clear(world);
            Matter.Engine.clear(engine);
            render.canvas.remove();
            render.canvas = null;
            render.context = null;
            render.textures = {};
        };
    }, [props.data]);

    return (
        <div
            ref={canvasRef}
            style={{
                width: props.canvasWidth,
                height: props.canvasHeight,
            }}
        />
    );
};

export default NodeGraph;
