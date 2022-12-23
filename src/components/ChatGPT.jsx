import React, { useEffect } from "react";
import { useRef } from "react";
import * as Matter from "matter-js";

const NodeGraph = ({ rootNode, childrenNodes }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        // Create a Matter.js engine and world
        const engine = Matter.Engine.create();
        const world = engine.world;

        // Create the root node body and add it to the world
        const rootNodeBody = Matter.Bodies.circle(
            rootNode.x,
            rootNode.y,
            rootNode.radius,
            {
                isStatic: true,
            }
        );
        Matter.World.add(world, rootNodeBody);

        // Create the children nodes bodies and add them to the world
        const childrenNodeBodies = childrenNodes.map((node) =>
            Matter.Bodies.circle(node.x, node.y, node.radius, {
                isStatic: true,
            })
        );

        Matter.World.add(world, childrenNodeBodies);
        // Create the edges between the root node and the children nodes
        const edges = childrenNodeBodies.map((node) =>
            Matter.Constraint.create({
                bodyA: rootNodeBody,
                bodyB: node,
                length: rootNode.radius,
                stiffness: 1,
            })
        );
        console.log(edges);
        Matter.World.add(world, edges);
        
        // Set up the canvas and render the node graph
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const render = Matter.Render.create({
            canvas,
            engine,
            options: { width: 1920, height: 1080 },
        });
        Matter.Render.run(render);
    }, [rootNode, childrenNodes]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: "100vw",
                height: "100vh",
            }}
        />
    );
};

export default NodeGraph;
