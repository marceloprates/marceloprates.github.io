---
title: 'Easyshader'
date: 2024-03-11
excerpt: "<img src='/images/sketches/easyshader/print-2.png'>"
tags: 
    - Generative Art
    - Cartography
    - OpenStreetMap
    - Maps
    - Python
---

Some time ago I started experimenting with using Signed Distance Functions (SDFs) for rendering 3D objects. SDFs are amazing because they allow you to drop the need for specifying a complex 3D mesh in order to render a 3D image. You can just specify objects using mathematical functions instead. The basic idea is to create a function $$f: \mathbb{R}^3 \rightarrow \mathbb{R}$$ that takes as input a $$(x,y,z)$$ coordinate in space and computes the (signed) distance between it and the surface of some object.

<img src='/images/sketches/easyshader/print-2.png' style = "width: 100%">

The meaning of computing "signed" distances is that the sign of the distance tells you whether you're inside (negative) or outside (positive) of the object. This clever trick allows for rendering scenes using a variant of the raycasting algorithm, called raymarching. Instead of casting rays and computing their intersections with the many polygons of a 3D mesh, we cast a ray and take very small steps in its direction instead, until the sign of the SDF changes from positive to negative. This means we have reached the surface of the object and can now scatter light from it.

<img src='/images/sketches/easyshader/ago17-gimp-2.png' style = "width: 100%">

It's easy to manipulate the material properties of objects, as you would in Blender. I like experimenting with defining the material properties (such as the angle with which the light reflects) as a function over $$\mathbb{R}^3$$. I made it vary a little as a function of the $$(x,y,z)$$ coordinates here:

<img src='/images/sketches/easyshader/abstract-cube-2-1-gimp-1.png' style = "width: 100%">

I found it very pleasing to train myself to visualize 3D shapes in terms of mathematical functions and operations over them. For example, I put myself to the test of creating the image of a mushroom by combining 3D primitives in easyshader. I initially hardcoded the following expression, which generates the mushroom image below:

```python
    cap = Sphere(.08) & Shape('-z')
    cap += f'-5e-5*abs(sin(12*ϕ(p)))'
    cap = cap.rotate(π/2,'x')
    shrink_factor = f'1+tanh(-.5*(y-.5*.08))'
    cap *= f'({shrink_factor}, 1, {shrink_factor})'
    stalk = Line((0,0,0),(0,-1,0),5e-3)
    mushroom_ = cap <<su(.1)>> stalk
```

<img src='/images/sketches/easyshader/single-mushroom-1-hd.png' style = "width: 100%">

But then I decided to parameterize it in order to be able to generate random, procedurally generated mushrooms :)

```python

def mushroom(
    R = .08,
    cap_height = 1,
    radial_distort = 5e-3,
    radial_distort_freq = 12,
    inflection_point = .5,
    inflection_intensity = 20,
    bend = 0,
    smooth_union = .1,
    stalk_thickness = 5e-3,
    stalk_height = 1,
    dx = 0,
    dy = 0,
    dz = 0,
    color = '#fff',
):
    cap = Sphere(R) & Shape(f'-z+{R*(1-cap_height)}')
    cap += f'-{.3*radial_distort}*abs(sin({radial_distort_freq}*ϕ(p)))'
    cap += 'rx π/2'
    shrink_factor = f'1+.99*tanh(-{inflection_intensity}*(y-{inflection_point*R}))'
    cap *= f'({shrink_factor}, 1, {shrink_factor})'
    stalk = Line((0,0,0),(0,-stalk_height,0),stalk_thickness)
    #stalk = stalk.bend(bend,'y')
    mushroom_ = cap <<su(smooth_union)>> stalk
    mushroom_ = mushroom_.bend(bend,'y')
    return mushroom_.paint(color)
```

<img src='/images/sketches/easyshader/mushroom-mosaic-seed=985772.png' style = "width: 100%">

I created a feature that enables me to export SDFs as polygon meshes, in order to be able to export them to Blender or to some slicer software for 3D printing. What I do is to cast several million rays inward from a sphere of certain radius centered at the object, record the intersections and then use Open3D to create a polygon mesh from the resulting point cloud. I can then import it into Blender:

<img src='/images/sketches/easyshader/mandelbulb-7-2.png' style = "width: 100%">

Exporting a polygon mesh also allows me to 3D print objects created with easyshader, such as this mushroom!

<img src='/images/sketches/easyshader/3d-printed-mushroom.jpg' style = "width: 100%">

This is a Mandelbulb, by the way. It's a 3D variant of the Mandelbrot fractal. The code used to define it in easyshader is shown in the image below:

<img src='/images/sketches/easyshader/mandelbulb-4-2.png' style = "width: 100%">

I had some fun experimenting with the possibility of bringing easyshader objects to life with augmented reality:

<img src='/images/sketches/easyshader/ar-fractal.png' style = "width: 100%">

<img src='/images/sketches/easyshader/print-2_A4_r-white-balance.png' style = "width: 100%">

<img src='/images/sketches/easyshader/chromatic-abherration-2-A4_r-white-balance.png' style = "width: 100%">