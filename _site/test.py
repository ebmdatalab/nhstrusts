from foo import Row

asd = Row(['1','2','yes'])

print [x.is_yes() for x in asd]
