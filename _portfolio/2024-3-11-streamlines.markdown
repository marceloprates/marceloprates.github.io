---
title: 'Streamlines'
date: 2024-03-11
excerpt: "<img src='/images/sketches/streamlines/streamlines-cover.png'>"
tags: 
    - Generative Art
    - Cartography
    - OpenStreetMap
    - Maps
    - Python
---

<img src='/images/sketches/streamlines/streamlines-cover.png' style = "width: 50%">

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

<img src='/images/sketches/streamlines/tsp-animation.gif' style = "width: 50%">
