import {
    MouseConstraint,
    Engine,
    Runner,
    Render,
    World,
    Bodies,
} from "matter-js";
import React from "react";
import { useRef } from "react";

const WorldTest = () => {
    // initialize refs for scene
    const scene = useRef();
    const engine = useRef(Engine.create());
    const render = useRef();
    const [cameraZoom, setCameraZoom] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
        // get canvas width and height
        const cw = document.body.clientWidth;
        const ch = document.body.clientHeight;

        setCameraZoom({ x: cw, y: ch });

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
        const ballA = Bodies.circle(320, 100, 40, 10);
        const ballB = Bodies.circle(450, 10, 40, 10);
        const ground = Bodies.rectangle(400, 380, 810, 60, { isStatic: true });

        // World.add(engine.current.world, [
        //     Bodies.rectangle(cw / 2, -10, cw, 20, { isStatic: true }),
        //     Bodies.rectangle(-10, ch / 2, 20, ch, { isStatic: true }),
        //     Bodies.rectangle(cw / 2, ch + 10, cw, 20, { isStatic: true }),
        //     Bodies.rectangle(cw + 10, ch / 2, 20, ch, { isStatic: true }),
        // ]);

        // add objects to world
        const zoomMultiplier = 1000;

        World.add(engine.current.world, [boxA, ballA, ballB, ground]);

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

        // set mouse interactions
        const mouseConstraint = MouseConstraint.create(engine.current, {
            //Create Constraint
            element: scene.current,
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

        // event listener for scrolling on canvas
        scene.current.addEventListener("mousewheel", handleScroll, false);
        scene.current.addEventListener("touchmove", handleScroll, false);

        // start engine
        Runner.run(engine.current);
        // run render process
        Render.run(render.current);

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
