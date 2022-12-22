import {
    MouseConstraint,
    Engine,
    Runner,
    Render,
    World,
    Bodies,
    Body,
    Composite,
    Constraint,
    Common,
    Mouse,
} from "matter-js";
import React from "react";
import { useRef } from "react";

const WorldTest = () => {
    // initialize refs for scene
    const scene = useRef();
    const engine = useRef(Engine.create());
    const render = useRef();
    const objects = useRef();

    React.useEffect(() => {
        // get canvas width and height
        const cw = document.body.clientWidth;
        const ch = document.body.clientHeight;

        // initialize render properties
        render.current = Render.create({
            element: scene.current,
            engine: engine.current,
            options: {
                width: cw,
                height: ch,
                background: "transparent",
            },
        });

        // initialize some objects
        const boxA = Bodies.rectangle(400, 200, 80, 80);
        const ballA = Bodies.circle(0, 0, 40, 10);
        const ballB = Bodies.circle(400, -200, 40, 10);
        const ground = Bodies.rectangle(400, 380, 810, 60, { isStatic: true });

        objects.current = [];
        // objects.current.push(boxA);
        objects.current.push();
        // objects.current.push(ballB);

        Composite.add(engine.current.world, ballA);
        Composite.add(
            engine.current.world,
            Constraint.create({
                bodyA: ballB,
                bodyB: ballA,
                stiffness: 0.00006,
                render: {
                    type: "line",
                    anchors: false,
                },
            })
        );
        Composite.add(
            engine.current.world,
            Constraint.create({
                bodyA: boxA,
                bodyB: ballA,
                stiffness: 0.00006,
                render: {
                    type: "line",
                    anchors: false,
                },
            })
        );
        Composite.add(
            engine.current.world,
            Constraint.create({
                bodyA: boxA,
                bodyB: ballB,
                stiffness: 0.000006,
                render: {
                    type: "line",
                    anchors: false,
                    visible: false,
                },
            })
        );
        // World.add(engine.current.world, [
        //     Bodies.rectangle(cw / 2, -10, cw, 20, { isStatic: true }),
        //     Bodies.rectangle(-10, ch / 2, 20, ch, { isStatic: true }),
        //     Bodies.rectangle(cw / 2, ch + 10, cw, 20, { isStatic: true }),
        //     Bodies.rectangle(cw + 10, ch / 2, 20, ch, { isStatic: true }),
        // ]);

        // add objects to world
        const zoomMultiplier = 1000;

        World.add(engine.current.world, [boxA, ballB, ground]);

        // initialize current camera zoom values
        let zoomX = cw;
        let zoomY = ch;
        Render.lookAt(render.current, ground, {
            x: zoomX,
            y: zoomY,
        });
        // console.log("Initial Zoom: x:", cw, "y:", ch);

        // handle scrolling on canvas
        const handleScroll = (event) => {
            // prevent default scrolling behaviors
            event.stopPropagation();
            event.preventDefault();

            const zoomSpeedMultiplier = 100;

            if (event.deltaY > 0 && zoomX < 3000) {
                // handle zoom out
                zoomX += zoomSpeedMultiplier;
                zoomY += zoomSpeedMultiplier;
                Render.lookAt(render.current, ground, {
                    x: zoomX,
                    y: zoomY,
                });
            } else if (event.deltaY <= 0 && zoomX > 500) {
                // handle zoom in
                zoomX -= zoomSpeedMultiplier;
                zoomY -= zoomSpeedMultiplier;
                Render.lookAt(render.current, ground, {
                    x: zoomX,
                    y: zoomY,
                });
            }
            // console.log("Updated Zoom: x:", zoomX, "y:", zoomY);
        };

        const mouse = Mouse.create(render.current.canvas);
        // set mouse interactions
        const mouseConstraint = MouseConstraint.create(engine.current, {
            //Create Constraint
            mouse: mouse,
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
        World.add(engine.current.world, mouseConstraint);
        render.current.mouse = mouse;
        // event listener for scrolling on canvas
        scene.current.addEventListener("mousewheel", handleScroll, false);
        scene.current.addEventListener("touchmove", handleScroll, false);

        engine.current.world.gravity.x = 0;
        engine.current.world.gravity.y = 0;

        // start engine
        Engine.run(engine.current);
        // run render process
        Render.run(render.current);

        const generateForce = () => {
            const a = 0.5;
            return {
                x: Common.random() * Common.choose([1, -1]) * a,
                y: Common.random() * Common.choose([1, -1]) * a,
            };
        };

        const updateScene = () => {
            // const magnitudeX = Math.random();
            // const magnitudeY = Math.random();
            // const directionX = Math.round(Math.random()) * 2 - 1;
            // const directionY = Math.round(Math.random()) * 2 - 1;
            // engine.current.gravity.x = Math.random() * magnitudeX * directionX;
            // engine.current.gravity.y = Math.random() * magnitudeY * directionY;
            // Engine.update(engine.current);
            objects.current.forEach((obj) => {
                console.log("applying force to:", obj);
                Body.applyForce(obj, obj.position, generateForce());
            });
        };

        const interval = setInterval(updateScene, 2000);
        // cleanup processes
        return () => {
            // stop render and clear world
            Render.stop(render.current);
            World.clear(engine.current.world);
            Engine.clear(engine.current);
            render.current.canvas.remove();
            render.current.canvas = null;
            render.current.context = null;
            render.current.textures = {};

            // stop interval scene updates
            clearInterval(interval);
            // cleanup event listeners
            scene.current.removeEventListener("mousewheel", handleScroll);
            scene.current.removeEventListener("touchmove", handleScroll);
        };
    }, []);

    return (
        <div
            ref={scene}
            style={{ width: "100vw", height: "100vh", overflow: "scroll" }}
        />
    );
};

export default WorldTest;
