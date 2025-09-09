---
title: "Streamlines"
date: "2024-03-11"
tags: ["Generative Art","Cartography","OpenStreetMap","Maps","Python"]
categories: []
excerpt: "<img src='/images/sketches/streamlines/streamlines-cover.png'>"
original_path: "_portfolio/2024-3-11-streamlines.markdown"
---

The basic idea here is to use streamlines (integral curves computed over vector fields) to create colorful artworks. Streamlines can be thought of as the trajectories of particles flowing through a fluid in which the velocity at each point is given by the vector field over which we integrate.

I use numerical integration to solve a system of Ordinary Differential Equations (ODEs) expressed by the function $$vector\_field\_fn: \mathbb{R}^2 \rightarrow \mathbb{R}^2$$:

```python 
lines = [
    LineString(
        solve_ivp(
            # Integrand
            lambda t, xy: vector_field_fn(*xy, t),
            # Timesteps
            [0, 4],
            # Initial condition
            [x0+dx, y0+dy],
            method="BDF",
            rtol=1e-6,
        ).y.T
    )
    for x0, y0 in seeds
]
```

$$vector\_field\_fn$$ is defined by sampling the coefficients of a 2nd degree polynomial over $$x$$ and $$y$$ from a normal distribution. The seeds for the initial conditions are sampled from an uniform distribution over the $$[-1,+1] \times [-1,+1]$$ square.

The streamlines are transformed into Shapely LineString objects, and a post-processing step is carried out to ``dilate'' them using different thickness values sampled from an uniform distribution.

The color of each individual curve is sampled randomly from a predefined color palette: <span style="color:#DB2B39">#DB2B39</span>, <span style="color:#46579B">#46579B</span>, <span style="color:#F3A712">#F3A712</span>, <span style="color:#F0CEA0">#F0CEA0</span>

By combining a median blur filter with Simple Linear Iterative Clustering (SLIC) applied over the stylized streamlines art, we can create a ``paint'' effect, with colors blending together in an organic way:

<img src='/images/sketches/streamlines/streamlines-cover.png' style = "width: 100%">

I was able to achieve very satisfactory results in some cases by adding color noise in the CIE-Lch space. This makes the final print less homogeneous, which in turn creates a more organic, "painterly" look:

<img src='/images/sketches/streamlines/manual-2-5___-gimp-1-square.png' style = "width: 100%">

I like how some vector fields yield streamlines that invoke a sense of movement and speed. When we apply the median blur + SLIC + color noise pipeline, the final result looks like splashing paint on a canvas.

<img src='/images/sketches/streamlines/207787-gimp-1-A4.png' style = "width: 100%">

One can also define the vector field manually to achieve specific desired effects. See for example a streamlines art created from the vector field describing the magnetic field of a magnetic dipole:

<img src='/images/sketches/streamlines/manual-2-5-gimp-1.png' style = "width: 100%">

I like to experiment with different kinds of media, so I tried rendering the streamline art shapes in Blender as well:

<img src='/images/sketches/streamlines/IMG_20230530_190957.png' style = "width: 100%">

I also experimented with printing streamlines arts on non-conventional ways, such as using an AxiDraw V3 pen plotter with a paintbrush and watercolor paint:

<img src='/images/sketches/streamlines/streamlines-watercolor-1.png' style = "width: 100%">

or using a regular pen:

<img src='/images/sketches/streamlines/streamlines-pen-2.png' style = "width: 100%">

One of my latest experiments is something I'm calling "TSP Animations". The idea is to be able to generate an animation from an unordered set of images. My approach is the following: I embed all images using a pretrained model (I'm currently using the Vision Transformer (ViT) model), compute a matrix of pairwise (cosine) distances and then run a heuristic Traveling Salesperson Problem solver on it to generate the smoothest possible sequence in terms of (image) semantic similarity. This is the result of computing a TSP Animation on a dataset of several streamline art examples, all randomly generated:

<img src='/images/sketches/streamlines/tsp-animation.gif' style = "width: 100%">
