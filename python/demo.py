""" Tkinter demo gui for bezier fitting algorithm

     (c) Volker Poplawski 2014
"""
from __future__ import print_function
from numpy import array
from bezier import *
from fitCurves import *
from Tkinter import *


# center of bounding box
def cntr(x1, y1, x2, y2):
    return x1+(x2-x1)/2, y1+(y2-y1)/2


# tkinter Canvas plus some addons
class MyCanvas(Canvas):
    def create_polyline(self, points, **kwargs):
        for p1, p2 in zip(points, points[1:]):
            self.create_line(p1, p2, kwargs)


    def create_bezier(self, b, tag):
        self.create_polyline([bezier.q(b, t/50.0).tolist() for t in xrange(0, 51)], tag=tag, fill='blue', width='2') # there are better ways to draw a bezier
        self.create_line(b[0].tolist(), b[1].tolist(), tag=tag)
        self.create_point(b[1][0], b[1][1], 2, fill='black', tag=tag)
        self.create_line(b[3].tolist(), b[2].tolist(), tag=tag)
        self.create_point(b[2][0], b[2][1], 2, fill='black', tag=tag)


    def create_point(self, x, y, r, **kwargs):
        return self.create_oval(x-r, y-r, x+r, y+r, kwargs)


    def pos(self, idOrTag):
        return cntr(*self.coords(idOrTag))


    def itemsAtPos(self, x, y, tag):
        return [item for item in self.find_overlapping(x, y, x, y) if tag in self.gettags(item)]


class MainObject:
    def run(self):
        root = Tk()

        self.canvas = MyCanvas(root, bg='white', width=400, height=400)
        self.canvas.pack(side=LEFT)

        frame = Frame(root, relief=SUNKEN, borderwidth=1)
        frame.pack(side=LEFT, fill=Y)
        label = Label(frame, text='Max Error')
        label.pack()
        self.spinbox = Spinbox(frame, width=8, from_=0.0, to=1000000.0, command=self.onSpinBoxValueChange)
        self.spinbox.insert(0, 10.0)
        self.spinbox.pack()

        self.points = []
        self.draggingPoint = None

        self.canvas.bind('<ButtonPress-1>', self.onButton1Press)
        self.canvas.bind('<ButtonPress-2>', self.onButton2Press)
        self.canvas.bind('<B1-Motion>', self.onMouseMove)
        self.canvas.bind('<ButtonRelease-1>', self.onButton1Release)

        root.mainloop()


    def onButton1Press(self, event):
        items = self.canvas.itemsAtPos(event.x, event.y, 'point')
        if items:
            self.draggingPoint = items[0]
        else:
            self.points.append(self.canvas.create_point(event.x, event.y, 4, fill='red', tag='point'))
            self.redraw()


    def onButton2Press(self, event):
        self.canvas.delete(self.points.pop())
        self.redraw()


    def onMouseMove(self, event):
        if self.draggingPoint:
            self.canvas.coords(self.draggingPoint, event.x-4, event.y-4, event.x+4, event.y+4)
            self.redraw()


    def onButton1Release(self, event):
        self.draggingPoint = None


    def onSpinBoxValueChange(self):
        self.redraw()


    def redraw(self):
        # redraw polyline
        self.canvas.delete('polyline')
        self.canvas.create_polyline([self.canvas.pos(pId) for pId in self.points], fill='grey', tag='polyline')
        self.canvas.tag_lower('polyline')

        # redraw bezier
        if len(self.points) < 2:
            return

        self.canvas.delete('bezier')
        points = array([self.canvas.pos(p) for p in self.points])
        beziers = fitCurve(points, float(self.spinbox.get())**2)
        for bezier in beziers:
            self.canvas.create_bezier(bezier, tag='bezier')


if __name__ == '__main__':
    o = MainObject()
    o.run()


